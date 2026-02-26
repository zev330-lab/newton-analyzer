#!/usr/bin/env python3
"""Generate data.js from Newton CSV files with investment scoring."""
import csv
import json
import math
import os

# Village ARV $/sqft
VILLAGE_ARV = {
    "NEWTON": 650, "NEWTON CENTRE": 750, "WEST NEWTON": 620,
    "CHESTNUT HILL": 800, "WABAN": 700, "NEWTONVILLE": 600,
    "AUBURNDALE": 580, "NEWTON HIGHLANDS": 650,
    "NEWTON UPPER FALLS": 550, "NEWTON LOWER FALLS": 560,
}
DEFAULT_ARV_PSF = 620

# Assumptions
RENO_PSF = 85
RENT_PSF_MO = 2.00
MORTGAGE_RATE = 0.06
DOWN_PCT = 0.25
CLOSING_PCT = 0.03
SELLING_PCT = 0.05
TAX_RATE = 0.0098
INSURANCE_YR = 3000
MAINT_PCT = 0.01
VACANCY_PCT = 0.05
HOLD_MONTHS_FLIP = 6
REFI_LTV = 0.75

def safe_float(v, default=0.0):
    if v is None or v == '':
        return default
    try:
        return float(str(v).replace(',', '').replace('$', ''))
    except:
        return default

def safe_int(v, default=0):
    if v is None or v == '':
        return default
    try:
        return int(float(str(v).replace(',', '')))
    except:
        return default

def get_village(city):
    if not city:
        return "NEWTON"
    c = city.strip().upper()
    if c in VILLAGE_ARV:
        return c
    return "NEWTON"

def score_price_efficiency(price_psf):
    if price_psf <= 0:
        return 0
    if price_psf < 350:
        return 3
    if price_psf < 450:
        return 2
    if price_psf < 550:
        return 1
    return 0

def score_seller_motivation(tenure):
    if tenure >= 50:
        return 3
    if tenure >= 35:
        return 2
    if tenure >= 25:
        return 1
    return 0

def score_profit_potential(roi):
    if roi > 30:
        return 3
    if roi > 20:
        return 2
    if roi > 10:
        return 1
    return 0

def score_lead_quality(lead_score, grade):
    if lead_score >= 11 and grade == 'A':
        return 3
    if lead_score >= 9 or grade == 'A':
        return 2
    if lead_score >= 7 or grade == 'B':
        return 1
    return 0

def assign_strategy(home_type, spread, gross_yield, land_pct):
    """Assign investment strategy based on property characteristics."""
    # BRRRR: multi-family with decent yield
    if home_type in ('MultiSmall', 'MultiLarge', 'Apt') and gross_yield > 4:
        return 'BRRRR'
    # Hold: good rental yield
    if gross_yield > 5:
        return 'Hold'
    # Value-Add: land value > 50% of total (underdeveloped)
    if land_pct > 0.5:
        return 'Value-Add'
    # Flip: good spread
    if spread > 50000:
        return 'Flip'
    # Default based on type
    if home_type in ('MultiSmall', 'MultiLarge', 'Apt'):
        return 'Hold'
    if spread > 0:
        return 'Flip'
    return 'Value-Add'

def monthly_payment(principal, annual_rate, years=30):
    if principal <= 0 or annual_rate <= 0:
        return 0
    r = annual_rate / 12
    n = years * 12
    return principal * (r * (1 + r)**n) / ((1 + r)**n - 1)

def process_property(row, has_extra):
    """Process a single property row and return dict or None."""
    total_val = safe_float(row.get('TOTAL_VAL', 0))
    res_area = safe_float(row.get('RES_AREA', 0))
    tenure = safe_float(row.get('TenureYrs', 0))
    lead_score = safe_float(row.get('LeadScore', 0))
    grade = (row.get('LeadGrade', '') or '').strip().upper()
    home_type = (row.get('HomeType', '') or '').strip()
    city = (row.get('CITY', '') or '').strip()
    village = get_village(city)

    if total_val <= 0 or res_area <= 0:
        return None

    # Price metrics
    price_psf = total_val / res_area
    arv_psf = VILLAGE_ARV.get(village, DEFAULT_ARV_PSF)
    arv = res_area * arv_psf
    reno_cost = res_area * RENO_PSF

    # Purchase = assessed value (proxy)
    purchase = total_val

    # Flip analysis
    closing_cost = purchase * CLOSING_PCT
    selling_cost = arv * SELLING_PCT
    loan_amount = purchase * (1 - DOWN_PCT)
    monthly_pmt = monthly_payment(loan_amount, MORTGAGE_RATE)
    hold_cost = monthly_pmt * HOLD_MONTHS_FLIP
    total_cost = purchase + reno_cost + closing_cost + selling_cost + hold_cost
    flip_profit = arv - total_cost
    cash_invested = purchase * DOWN_PCT + closing_cost + reno_cost
    flip_roi = (flip_profit / cash_invested * 100) if cash_invested > 0 else 0

    # Rental analysis
    monthly_rent = res_area * RENT_PSF_MO
    annual_rent = monthly_rent * 12
    annual_tax = total_val * TAX_RATE
    annual_mortgage = monthly_pmt * 12
    annual_maint = total_val * MAINT_PCT
    annual_vacancy = annual_rent * VACANCY_PCT

    annual_expenses = annual_mortgage + annual_tax + INSURANCE_YR + annual_maint + annual_vacancy
    monthly_cashflow = (annual_rent - annual_expenses) / 12
    noi = annual_rent - (annual_tax + INSURANCE_YR + annual_maint + annual_vacancy)
    gross_yield = (annual_rent / total_val * 100) if total_val > 0 else 0
    cap_rate = (noi / total_val * 100) if total_val > 0 else 0

    # BRRRR
    refi_val = arv * REFI_LTV
    brrrr_cash_in = cash_invested
    brrrr_cash_left = max(0, brrrr_cash_in - refi_val)
    refi_pmt = monthly_payment(refi_val, MORTGAGE_RATE)
    brrrr_cf = monthly_rent - refi_pmt - annual_tax/12 - INSURANCE_YR/12 - annual_maint/12 - annual_vacancy/12

    # Land value percentage
    bldg_val = safe_float(row.get('BLDG_VAL', 0))
    land_val = safe_float(row.get('LAND_VAL', 0))
    land_pct = (land_val / total_val) if total_val > 0 and land_val > 0 else 0.3

    # Scoring
    s1 = score_price_efficiency(price_psf)
    s2 = score_seller_motivation(tenure)
    s3 = score_profit_potential(flip_roi)
    s4 = score_lead_quality(lead_score, grade)
    inv_score = s1 + s2 + s3 + s4

    if inv_score < 3:
        return None

    # Strategy
    strategy = assign_strategy(home_type, flip_profit, gross_yield, land_pct)

    # Build output
    prop = {
        'id': (row.get('PROP_ID', '') or '').strip(),
        'addr': (row.get('SITE_ADDR', '') or '').strip(),
        'village': village,
        'city': city.upper() if city else 'NEWTON',
        'zip': (row.get('ZIP', '') or '').strip(),
        'owner': (row.get('OWNER1', '') or '').strip(),
        'type': home_type,
        'useCode': (row.get('USE_CODE', '') or '').strip(),
        'val': round(total_val),
        'sqft': round(res_area),
        'psf': round(price_psf),
        'tenure': round(tenure, 1),
        'leadScore': round(lead_score, 1),
        'grade': grade if grade in ('A','B','C','D') else 'D',
        'segment': (row.get('Segment', '') or '').strip(),
        'invScore': inv_score,
        's1': s1, 's2': s2, 's3': s3, 's4': s4,
        'strategy': strategy,
        # Financials
        'arv': round(arv),
        'arvPsf': arv_psf,
        'reno': round(reno_cost),
        'purchase': round(purchase),
        'flipProfit': round(flip_profit),
        'flipROI': round(flip_roi, 1),
        'totalCost': round(total_cost),
        'closingCost': round(closing_cost),
        'sellingCost': round(selling_cost),
        'holdCost': round(hold_cost),
        'loanAmt': round(loan_amount),
        'monthlyPmt': round(monthly_pmt),
        # Rental
        'rent': round(monthly_rent),
        'cashflow': round(monthly_cashflow),
        'noi': round(noi),
        'grossYield': round(gross_yield, 2),
        'capRate': round(cap_rate, 2),
        'annualTax': round(annual_tax),
        'annualMaint': round(annual_maint),
        'annualVacancy': round(annual_vacancy),
        # BRRRR
        'brrrrCashIn': round(brrrr_cash_in),
        'brrrrRefi': round(refi_val),
        'brrrrCashLeft': round(brrrr_cash_left),
        'brrrrCF': round(brrrr_cf),
    }

    # Extra fields from top50
    if has_extra:
        prop['bldgVal'] = round(bldg_val)
        prop['landVal'] = round(land_val)
        prop['landPct'] = round(land_pct * 100, 1)
        prop['lotSize'] = safe_float(row.get('LOT_SIZE', 0))
        prop['yrBuilt'] = safe_int(row.get('YEAR_BUILT', 0))
        prop['bldArea'] = safe_float(row.get('BLD_AREA', 0))
        prop['style'] = (row.get('STYLE', '') or '').strip()
        prop['stories'] = safe_float(row.get('STORIES', 0))
        prop['rooms'] = safe_int(row.get('NUM_ROOMS', 0))
        prop['zoning'] = (row.get('ZONING', '') or '').strip()
        prop['lsPrice'] = safe_float(row.get('LS_PRICE', 0))

    return prop

def main():
    leads_path = os.path.expanduser("~/Desktop/Lead Scoring/Newton/Newton_predictive_leads.csv")
    top50_path = os.path.expanduser("~/Desktop/Lead Scoring/Newton/Newton_top50_full.csv")

    # Read top50 into dict by PROP_ID for merging
    top50_extra = {}
    with open(top50_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            pid = (row.get('PROP_ID', '') or '').strip()
            if pid:
                top50_extra[pid] = row

    print(f"Top50 loaded: {len(top50_extra)} properties")

    # Process all predictive leads
    properties = []
    skipped = 0
    seen_ids = set()

    with open(leads_path, 'r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            pid = (row.get('PROP_ID', '') or '').strip()

            # Merge top50 extra fields if available
            has_extra = False
            if pid in top50_extra:
                extra = top50_extra[pid]
                for k, v in extra.items():
                    if k not in row or not row[k]:
                        row[k] = v
                    # Always take these from top50
                    if k in ('BLDG_VAL', 'LAND_VAL', 'LOT_SIZE', 'YEAR_BUILT', 'BLD_AREA',
                             'STYLE', 'STORIES', 'NUM_ROOMS', 'ZONING', 'LS_PRICE'):
                        row[k] = v
                has_extra = True

            prop = process_property(row, has_extra)
            if prop and prop['id'] not in seen_ids:
                properties.append(prop)
                seen_ids.add(prop['id'])
            else:
                skipped += 1

    # Sort by investment score desc, then flip ROI desc
    properties.sort(key=lambda p: (-p['invScore'], -p['flipROI']))

    print(f"Total properties scored >= 3: {len(properties)}")
    print(f"Skipped (score < 3 or dupe or invalid): {skipped}")

    # Compute stats
    vals = [p['val'] for p in properties]
    psfs = [p['psf'] for p in properties]
    tenures = [p['tenure'] for p in properties]
    scores = [p['invScore'] for p in properties]
    rois = [p['flipROI'] for p in properties]

    strategies = {}
    grades = {}
    villages = {}
    types = {}
    for p in properties:
        strategies[p['strategy']] = strategies.get(p['strategy'], 0) + 1
        grades[p['grade']] = grades.get(p['grade'], 0) + 1
        villages[p['village']] = villages.get(p['village'], 0) + 1
        types[p['type']] = types.get(p['type'], 0) + 1

    def median(lst):
        s = sorted(lst)
        n = len(s)
        if n == 0:
            return 0
        if n % 2 == 0:
            return (s[n//2-1] + s[n//2]) / 2
        return s[n//2]

    stats = {
        'total': len(properties),
        'totalAnalyzed': 25711,
        'medianVal': round(median(vals)),
        'medianPsf': round(median(psfs)),
        'avgScore': round(sum(scores)/len(scores), 1) if scores else 0,
        'medianTenure': round(median(tenures), 1),
        'medianROI': round(median(rois), 1),
        'strategies': strategies,
        'grades': grades,
        'villages': villages,
        'types': types,
        'mortgageRate': MORTGAGE_RATE * 100,
        'taxRate': TAX_RATE * 1000,
    }

    print(f"\nStats: median val=${stats['medianVal']:,}, median psf=${stats['medianPsf']}")
    print(f"Strategies: {strategies}")
    print(f"Grades: {grades}")
    print(f"Villages: {dict(sorted(villages.items(), key=lambda x: -x[1]))}")

    # Write data.js
    out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data.js')
    with open(out_path, 'w') as f:
        f.write('window.__PROPERTIES__=')
        json.dump(properties, f, separators=(',', ':'))
        f.write(';\nwindow.__STATS__=')
        json.dump(stats, f, separators=(',', ':'))
        f.write(';\n')

    fsize = os.path.getsize(out_path)
    print(f"\nWrote {out_path} ({fsize:,} bytes, {len(properties)} properties)")

if __name__ == '__main__':
    main()
