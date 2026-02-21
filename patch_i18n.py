import json

def patch_json(filepath, is_fr):
    with open(filepath, 'r') as f:
        data = json.load(f)
        
    # Add countryList
    data['countryList'] = {
		"GA": "Gabon",
		"FR": "France",
		"CM": "Cameroun" if is_fr else "Cameroon",
		"CG": "Congo",
		"CD": "RD Congo" if is_fr else "DR Congo",
		"SN": "Sénégal" if is_fr else "Senegal",
		"CI": "Côte d'Ivoire" if is_fr else "Ivory Coast",
		"MA": "Maroc" if is_fr else "Morocco",
		"TN": "Tunisie" if is_fr else "Tunisia",
		"DZ": "Algérie" if is_fr else "Algeria",
		"BE": "Belgique" if is_fr else "Belgium",
		"CH": "Suisse" if is_fr else "Switzerland",
		"CA": "Canada",
		"US": "États-Unis" if is_fr else "United States"
    }

    # Add enums
    data['enums'] = {
		"gender": {
			"male": "Masculin" if is_fr else "Male",
			"female": "Féminin" if is_fr else "Female",
			"other": "Autre" if is_fr else "Other"
		},
		"maritalStatus": {
			"single": "Célibataire" if is_fr else "Single",
			"married": "Marié(e)" if is_fr else "Married",
			"divorced": "Divorcé(e)" if is_fr else "Divorced",
			"widowed": "Veuf/Veuve" if is_fr else "Widowed",
			"civil_union": "Pacsé(e)" if is_fr else "Civil Union",
			"cohabiting": "En concubinage" if is_fr else "Cohabiting",
			"pacs": "Pacsé(e)" if is_fr else "Civil Union"
		},
		"workStatus": {
			"self_employed": "Indépendant(e)" if is_fr else "Self-employed",
			"employee": "Employé(e) / Salarié(e)" if is_fr else "Employee",
			"independent": "Indépendant(e)" if is_fr else "Independent",
			"entrepreneur": "Entrepreneur",
			"unemployed": "Sans emploi" if is_fr else "Unemployed",
			"retired": "Retraité(e)" if is_fr else "Retired",
			"student": "Étudiant(e)" if is_fr else "Student",
			"other": "Autre" if is_fr else "Other"
		},
		"nationalityAcquisition": {
			"birth": "Filiation (Naissance)" if is_fr else "Birth",
			"naturalization": "Naturalisation" if is_fr else "Naturalization",
			"marriage": "Mariage" if is_fr else "Marriage",
			"adoption": "Adoption",
			"other": "Autre" if is_fr else "Other",
			"declaration": "Déclaration" if is_fr else "Declaration"
		}
    }

    # Add missing keys to profile
    if 'profile' not in data:
        data['profile'] = {}
    if 'passport' not in data['profile']:
        data['profile']['passport'] = {}
    
    data['profile']['passport']['issuingAuthority'] = "Autorité" if is_fr else "Authority"
    data['profile']['passport']['number'] = "Numéro" if is_fr else "Number"
    data['profile']['passport']['issueDate'] = "Délivré le" if is_fr else "Issue Date"
    data['profile']['passport']['expiryDate'] = "Expire le" if is_fr else "Expiry Date"

    if 'fields' not in data['profile']:
        data['profile']['fields'] = {}
    data['profile']['fields']['nipCode'] = "NIP"
    
    data['profile']['profileDetails'] = "Profil du demandeur" if is_fr else "Applicant Profile"
    
    # Save back
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent='\t', ensure_ascii=False)

patch_json('/Users/berny/Developer/consulat.ga/src/integrations/i18n/locales/fr.json', True)
patch_json('/Users/berny/Developer/consulat.ga/src/integrations/i18n/locales/en.json', False)

print("Patch complete!")
