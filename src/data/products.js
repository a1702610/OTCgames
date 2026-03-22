// OTC Games — Pharmacy Product Library
// Developer-maintained. Do not edit product IDs (they match image filenames).

export const shelves = [
  { id: 'cold-flu-1',  label: 'Cold & Flu',          shelfNumber: 1, emoji: '🤧', color: '#4A90D9' },
  { id: 'cold-flu-2',  label: 'Cold & Flu',          shelfNumber: 2, emoji: '🤧', color: '#4A90D9' },
  { id: 'ent',         label: 'ENT',                  shelfNumber: 1, emoji: '👂', color: '#9B59B6' },
  { id: 'eyes',        label: 'Eyes',                 shelfNumber: 1, emoji: '👁️', color: '#1ABC9C' },
  { id: 'gi-1',        label: 'Gastrointestinal',     shelfNumber: 1, emoji: '🫁', color: '#E67E22' },
  { id: 'gi-2',        label: 'Gastrointestinal',     shelfNumber: 2, emoji: '🫁', color: '#E67E22' },
  { id: 'gi-3',        label: 'Gastrointestinal',     shelfNumber: 3, emoji: '🫁', color: '#E67E22' },
  { id: 'hayfever',    label: 'Hayfever',             shelfNumber: 1, emoji: '🌿', color: '#27AE60' },
  { id: 'pain-1',      label: 'Pain Management',      shelfNumber: 1, emoji: '💊', color: '#E74C3C' },
  { id: 'pain-2',      label: 'Pain Management',      shelfNumber: 2, emoji: '💊', color: '#E74C3C' },
  { id: 's3-1',        label: 'S3 Products',          shelfNumber: 1, emoji: '🔒', color: '#8E44AD' },
  { id: 's3-2',        label: 'S3 Products',          shelfNumber: 2, emoji: '🔒', color: '#8E44AD' },
  { id: 's3-3',        label: 'S3 Products',          shelfNumber: 3, emoji: '🔒', color: '#8E44AD' },
  { id: 's3-4',        label: 'S3 Products',          shelfNumber: 4, emoji: '🔒', color: '#8E44AD' },
  { id: 's3-5',        label: 'S3 Products',          shelfNumber: 5, emoji: '🔒', color: '#8E44AD' },
  { id: 's3-6',        label: 'S3 Products',          shelfNumber: 6, emoji: '🔒', color: '#8E44AD' },
  { id: 'skin',        label: 'Skin',                 shelfNumber: 1, emoji: '🧴', color: '#F39C12' },
  { id: 'smoking',     label: 'Smoking Cessation',    shelfNumber: 1, emoji: '🚭', color: '#7F8C8D' },
]

export const products = [
  // === Cold & Flu Shelf 1 ===
  { id: 'codral-original',    name: 'Codral Original Day & Night',  brand: 'Codral',     category: 'cold-flu-1', activeIngredient: 'Paracetamol 500mg, Pseudoephedrine HCl 30mg, Dextromethorphan HBr 15mg',  color: '#FFFFFF', bgColor: '#C0392B' },
  { id: 'codral-pe-free',     name: 'Codral PE Free Cold & Flu',    brand: 'Codral',     category: 'cold-flu-1', activeIngredient: 'Paracetamol 500mg, Dextromethorphan HBr 15mg, Chlorpheniramine 2mg',        color: '#FFFFFF', bgColor: '#E74C3C' },
  { id: 'lemsip-max',         name: 'Lemsip Max All-in-One',        brand: 'Lemsip',     category: 'cold-flu-1', activeIngredient: 'Paracetamol 1000mg, Phenylephrine HCl 12.2mg, Caffeine 25mg',              color: '#FFFFFF', bgColor: '#2980B9' },
  { id: 'demazin-syrup',      name: 'Demazin Cold Relief Syrup',    brand: 'Demazin',    category: 'cold-flu-1', activeIngredient: 'Chlorpheniramine 1mg/5mL, Phenylephrine 2.5mg/5mL',                        color: '#140F50', bgColor: '#8E44AD' },
  { id: 'dimetapp-cold',      name: 'Dimetapp Cold & Allergy Elixir', brand: 'Dimetapp', category: 'cold-flu-1', activeIngredient: 'Brompheniramine Maleate 1mg/5mL, Phenylephrine HCl 2.5mg/5mL',            color: '#FFFFFF', bgColor: '#9B59B6' },
  { id: 'robitussin-cf',      name: 'Robitussin Chesty Cough & Nasal Congestion', brand: 'Robitussin', category: 'cold-flu-1', activeIngredient: 'Guaifenesin 100mg/5mL, Phenylephrine HCl 5mg/5mL',      color: '#FFFFFF', bgColor: '#16A085' },

  // === Cold & Flu Shelf 2 ===
  { id: 'vicks-vaporub',      name: 'Vicks VapoRub',                brand: 'Vicks',      category: 'cold-flu-2', activeIngredient: 'Camphor 4.8%, Eucalyptus Oil 1.2%, Menthol 2.6%',                         color: '#FFFFFF', bgColor: '#1448FF' },
  { id: 'vicks-sinex',        name: 'Vicks Sinex Nasal Spray',      brand: 'Vicks',      category: 'cold-flu-2', activeIngredient: 'Oxymetazoline HCl 0.05%',                                                 color: '#FFFFFF', bgColor: '#2471A3' },
  { id: 'otrivin-adult',      name: 'Otrivin Adult Nasal Spray',    brand: 'Otrivin',    category: 'cold-flu-2', activeIngredient: 'Xylometazoline HCl 0.1%',                                                 color: '#FFFFFF', bgColor: '#1F618D' },
  { id: 'nasonex-otc',        name: 'Nasonex 24HR Allergy',         brand: 'Nasonex',    category: 'cold-flu-2', activeIngredient: 'Mometasone Furoate 50mcg/spray',                                          color: '#140F50', bgColor: '#AED6F1' },
  { id: 'drixine',            name: 'Drixine Nasal Spray',          brand: 'Drixine',    category: 'cold-flu-2', activeIngredient: 'Oxymetazoline HCl 0.05%',                                                 color: '#FFFFFF', bgColor: '#117A65' },
  { id: 'bisolvon-chesty',    name: 'Bisolvon Chesty Forte',        brand: 'Bisolvon',   category: 'cold-flu-2', activeIngredient: 'Bromhexine HCl 8mg',                                                      color: '#FFFFFF', bgColor: '#E67E22' },

  // === ENT ===
  { id: 'strepsils-original', name: 'Strepsils Original',           brand: 'Strepsils',  category: 'ent', activeIngredient: '2,4-Dichlorobenzyl Alcohol 1.2mg, Amylmetacresol 0.6mg',                         color: '#FFFFFF', bgColor: '#C0392B' },
  { id: 'difflam-spray',      name: 'Difflam Anti-inflammatory Throat Spray', brand: 'Difflam', category: 'ent', activeIngredient: 'Benzydamine HCl 0.15%',                                              color: '#FFFFFF', bgColor: '#2980B9' },
  { id: 'betadine-gargle',    name: 'Betadine Sore Throat Gargle',  brand: 'Betadine',   category: 'ent', activeIngredient: 'Povidone-Iodine 0.45%',                                                          color: '#FFFFFF', bgColor: '#8E44AD' },
  { id: 'debrox-ear',         name: 'Debrox Ear Drops',             brand: 'Debrox',     category: 'ent', activeIngredient: 'Carbamide Peroxide 6.5%',                                                        color: '#140F50', bgColor: '#F0B27A' },
  { id: 'cerumol',            name: 'Cerumol Ear Drops',            brand: 'Cerumol',    category: 'ent', activeIngredient: 'Arachis Oil 57.3%, Chlorobutanol 5%, Paradichlorobenzene 2%',                   color: '#140F50', bgColor: '#FAD7A0' },

  // === Eyes ===
  { id: 'visine-original',    name: 'Visine Original Eye Drops',    brand: 'Visine',     category: 'eyes', activeIngredient: 'Tetrahydrozoline HCl 0.05%',                                                   color: '#FFFFFF', bgColor: '#1ABC9C' },
  { id: 'systane-ultra',      name: 'Systane Ultra Eye Drops',      brand: 'Systane',    category: 'eyes', activeIngredient: 'Polyethylene Glycol 400 0.4%, Propylene Glycol 0.3%',                          color: '#FFFFFF', bgColor: '#148F77' },
  { id: 'optrex-allergy',     name: 'Optrex Allergy Eye Drops',     brand: 'Optrex',     category: 'eyes', activeIngredient: 'Sodium Cromoglicate 2%',                                                        color: '#140F50', bgColor: '#A9DFBF' },
  { id: 'bausch-renu',        name: 'Bausch + Lomb renu MPS',       brand: 'Bausch + Lomb', category: 'eyes', activeIngredient: 'Boric Acid, Sodium Borate, NaCl, Poloxamine 0.01%, DYMED 0.0001%',       color: '#FFFFFF', bgColor: '#5DADE2' },

  // === Gastrointestinal Shelf 1 ===
  { id: 'gaviscon-advance',   name: 'Gaviscon Advance',             brand: 'Gaviscon',   category: 'gi-1', activeIngredient: 'Sodium Alginate 500mg, Potassium Bicarbonate 100mg',                            color: '#FFFFFF', bgColor: '#E67E22' },
  { id: 'nexium-24hr',        name: 'Nexium 24HR',                  brand: 'Nexium',     category: 'gi-1', activeIngredient: 'Esomeprazole 20mg',                                                             color: '#FFFFFF', bgColor: '#884EA0' },
  { id: 'mylanta-original',   name: 'Mylanta Original Antacid',     brand: 'Mylanta',    category: 'gi-1', activeIngredient: 'Aluminium Hydroxide 200mg, Magnesium Hydroxide 200mg, Simethicone 20mg',       color: '#140F50', bgColor: '#F9E79F' },
  { id: 'rennies',            name: 'Rennies Heartburn Relief',     brand: 'Rennies',    category: 'gi-1', activeIngredient: 'Calcium Carbonate 680mg, Magnesium Carbonate 80mg',                             color: '#140F50', bgColor: '#FDEBD0' },
  { id: 'zantac-150',         name: 'Pepcid AC 10mg',               brand: 'Pepcid',     category: 'gi-1', activeIngredient: 'Famotidine 10mg',                                                               color: '#FFFFFF', bgColor: '#E74C3C' },

  // === Gastrointestinal Shelf 2 ===
  { id: 'imodium-original',   name: 'Imodium Original',             brand: 'Imodium',    category: 'gi-2', activeIngredient: 'Loperamide HCl 2mg',                                                            color: '#FFFFFF', bgColor: '#27AE60' },
  { id: 'gastro-stop',        name: 'Gastro-Stop',                  brand: 'Gastro-Stop', category: 'gi-2', activeIngredient: 'Loperamide HCl 2mg',                                                          color: '#FFFFFF', bgColor: '#1E8449' },
  { id: 'diareze',            name: 'Diareze Capsules',             brand: 'Diareze',    category: 'gi-2', activeIngredient: 'Loperamide HCl 2mg',                                                            color: '#FFFFFF', bgColor: '#196F3D' },
  { id: 'dulcolax-tabs',      name: 'Dulcolax Tablets',             brand: 'Dulcolax',   category: 'gi-2', activeIngredient: 'Bisacodyl 5mg',                                                                 color: '#FFFFFF', bgColor: '#F39C12' },
  { id: 'coloxyl-senna',      name: 'Coloxyl with Senna',           brand: 'Coloxyl',    category: 'gi-2', activeIngredient: 'Docusate Sodium 50mg, Sennoside B 8mg',                                         color: '#FFFFFF', bgColor: '#D35400' },

  // === Gastrointestinal Shelf 3 ===
  { id: 'movicol',            name: 'Movicol Sachets',              brand: 'Movicol',    category: 'gi-3', activeIngredient: 'Macrogol 3350 13.125g, Sodium Chloride 350.7mg, Sodium Bicarbonate 178.5mg, Potassium Chloride 46.6mg', color: '#FFFFFF', bgColor: '#2C3E50' },
  { id: 'metamucil',          name: 'Metamucil Orange',             brand: 'Metamucil',  category: 'gi-3', activeIngredient: 'Psyllium Husks 3.4g/dose',                                                      color: '#140F50', bgColor: '#F7DC6F' },
  { id: 'gastrolyte',         name: 'Gastrolyte Sachets',           brand: 'Gastrolyte', category: 'gi-3', activeIngredient: 'Sodium Chloride 470mg, Potassium Chloride 300mg, Glucose 4g, Trisodium Citrate 530mg', color: '#FFFFFF', bgColor: '#85C1E9' },
  { id: 'buscopan',           name: 'Buscopan',                     brand: 'Buscopan',   category: 'gi-3', activeIngredient: 'Hyoscine Butylbromide 10mg',                                                    color: '#FFFFFF', bgColor: '#E74C3C' },
  { id: 'colpermin',          name: 'Colpermin Capsules',           brand: 'Colpermin',  category: 'gi-3', activeIngredient: 'Peppermint Oil 187mg',                                                           color: '#FFFFFF', bgColor: '#27AE60' },

  // === Hayfever ===
  { id: 'claratyne',          name: 'Claratyne Tablets',            brand: 'Claratyne',  category: 'hayfever', activeIngredient: 'Loratadine 10mg',                                                           color: '#FFFFFF', bgColor: '#27AE60' },
  { id: 'zyrtec-tablets',     name: 'Zyrtec Tablets',               brand: 'Zyrtec',     category: 'hayfever', activeIngredient: 'Cetirizine HCl 10mg',                                                       color: '#FFFFFF', bgColor: '#1448FF' },
  { id: 'telfast-180',        name: 'Telfast 180mg',                brand: 'Telfast',    category: 'hayfever', activeIngredient: 'Fexofenadine HCl 180mg',                                                    color: '#FFFFFF', bgColor: '#E74C3C' },
  { id: 'flixonase',          name: 'Flixonase Allergy & Hayfever', brand: 'Flixonase',  category: 'hayfever', activeIngredient: 'Fluticasone Propionate 50mcg/spray',                                        color: '#FFFFFF', bgColor: '#884EA0' },
  { id: 'rhinocort-aqua',     name: 'Rhinocort Aqua',               brand: 'Rhinocort',  category: 'hayfever', activeIngredient: 'Budesonide 32mcg/spray',                                                    color: '#140F50', bgColor: '#D6EAF8' },
  { id: 'zaditen-eye',        name: 'Zaditen Eye Drops',            brand: 'Zaditen',    category: 'hayfever', activeIngredient: 'Ketotifen Fumarate 0.025%',                                                  color: '#140F50', bgColor: '#A9CCE3' },

  // === Pain Management Shelf 1 ===
  { id: 'panadol-original',   name: 'Panadol Original',             brand: 'Panadol',    category: 'pain-1', activeIngredient: 'Paracetamol 500mg',                                                           color: '#FFFFFF', bgColor: '#E74C3C' },
  { id: 'panadol-extend',     name: 'Panadol Extend',               brand: 'Panadol',    category: 'pain-1', activeIngredient: 'Paracetamol 665mg (modified release)',                                         color: '#FFFFFF', bgColor: '#C0392B' },
  { id: 'nurofen-original',   name: 'Nurofen Original',             brand: 'Nurofen',    category: 'pain-1', activeIngredient: 'Ibuprofen 200mg',                                                             color: '#FFFFFF', bgColor: '#E67E22' },
  { id: 'nurofen-plus',       name: 'Nurofen Plus',                 brand: 'Nurofen',    category: 'pain-1', activeIngredient: 'Ibuprofen 200mg, Codeine Phosphate 12.8mg',                                   color: '#FFFFFF', bgColor: '#D35400' },
  { id: 'aspirin-tablets',    name: 'Aspirin 300mg Tablets',        brand: 'Generic',    category: 'pain-1', activeIngredient: 'Aspirin 300mg',                                                               color: '#140F50', bgColor: '#BDC3C7' },
  { id: 'mersyndol-day',      name: 'Mersyndol Daytime',            brand: 'Mersyndol',  category: 'pain-1', activeIngredient: 'Paracetamol 450mg, Codeine Phosphate 9.75mg',                                 color: '#FFFFFF', bgColor: '#2C3E50' },

  // === Pain Management Shelf 2 ===
  { id: 'voltaren-gel',       name: 'Voltaren Emulgel 1%',          brand: 'Voltaren',   category: 'pain-2', activeIngredient: 'Diclofenac Diethylamine 1.16% (equiv. Diclofenac Sodium 1%)',                 color: '#FFFFFF', bgColor: '#E74C3C' },
  { id: 'deep-heat',          name: 'Deep Heat Rub',                brand: 'Deep Heat',  category: 'pain-2', activeIngredient: 'Methyl Salicylate 12.8%, Menthol 5.9%',                                       color: '#140F50', bgColor: '#F8C471' },
  { id: 'fisiocrem',          name: 'Fisiocrem Solugel',            brand: 'Fisiocrem',  category: 'pain-2', activeIngredient: 'Arnica Montana 1.5%, Calendula Officinalis 1%',                               color: '#FFFFFF', bgColor: '#1E8449' },
  { id: 'dencorub',           name: 'Dencorub Cream',               brand: 'Dencorub',   category: 'pain-2', activeIngredient: 'Methyl Salicylate 20%, Menthol 1%',                                           color: '#140F50', bgColor: '#AED6F1' },
  { id: 'panadol-osteo',      name: 'Panadol Osteo',                brand: 'Panadol',    category: 'pain-2', activeIngredient: 'Paracetamol 665mg (modified release)',                                         color: '#FFFFFF', bgColor: '#8E44AD' },

  // === S3 Products Shelves 1–6 ===
  // S3-1: Codeine combinations
  { id: 'panadeine',          name: 'Panadeine',                    brand: 'Panadeine',  category: 's3-1', activeIngredient: 'Paracetamol 500mg, Codeine Phosphate 8mg',                                      color: '#FFFFFF', bgColor: '#6C3483' },
  { id: 'panadeine-forte',    name: 'Panadeine Forte',              brand: 'Panadeine',  category: 's3-1', activeIngredient: 'Paracetamol 500mg, Codeine Phosphate 30mg',                                     color: '#FFFFFF', bgColor: '#512E5F' },
  { id: 'codeine-tablets',    name: 'Codeine Phosphate 30mg',       brand: 'Generic',    category: 's3-1', activeIngredient: 'Codeine Phosphate 30mg',                                                         color: '#140F50', bgColor: '#D2B4DE' },

  // S3-2: Sleep aids / Sedating antihistamines
  { id: 'restavit',           name: 'Restavit Tablets',             brand: 'Restavit',   category: 's3-2', activeIngredient: 'Doxylamine Succinate 25mg',                                                     color: '#FFFFFF', bgColor: '#1A5276' },
  { id: 'phenergan-tablets',  name: 'Phenergan 10mg Tablets',       brand: 'Phenergan',  category: 's3-2', activeIngredient: 'Promethazine HCl 10mg',                                                         color: '#FFFFFF', bgColor: '#154360' },
  { id: 'unisom',             name: 'Unisom Sleep Aid',             brand: 'Unisom',     category: 's3-2', activeIngredient: 'Doxylamine Succinate 25mg',                                                     color: '#FFFFFF', bgColor: '#1F618D' },

  // S3-3: Pseudoephedrine
  { id: 'sudafed-pe',         name: 'Sudafed PE Decongestant',      brand: 'Sudafed',    category: 's3-3', activeIngredient: 'Phenylephrine HCl 10mg',                                                        color: '#FFFFFF', bgColor: '#E74C3C' },
  { id: 'sudafed-original',   name: 'Sudafed Original 60mg',        brand: 'Sudafed',    category: 's3-3', activeIngredient: 'Pseudoephedrine HCl 60mg',                                                      color: '#FFFFFF', bgColor: '#C0392B' },
  { id: 'dimetapp-pe',        name: 'Dimetapp PE Non-Drowsy',       brand: 'Dimetapp',   category: 's3-3', activeIngredient: 'Phenylephrine HCl 10mg',                                                        color: '#FFFFFF', bgColor: '#9B59B6' },

  // S3-4: Minoxidil / Hair loss
  { id: 'rogaine-men',        name: 'Rogaine Men 5% Solution',      brand: 'Rogaine',    category: 's3-4', activeIngredient: 'Minoxidil 5%',                                                                  color: '#FFFFFF', bgColor: '#2C3E50' },
  { id: 'rogaine-women',      name: 'Rogaine Women 2% Solution',    brand: 'Rogaine',    category: 's3-4', activeIngredient: 'Minoxidil 2%',                                                                  color: '#FFFFFF', bgColor: '#5D6D7E' },
  { id: 'kirkland-minox',     name: 'Kirkland Minoxidil 5%',        brand: 'Kirkland',   category: 's3-4', activeIngredient: 'Minoxidil 5%',                                                                  color: '#140F50', bgColor: '#AEB6BF' },

  // S3-5: Topical antifungals / Vaginal
  { id: 'canesten-cream',     name: 'Canesten Topical Cream 1%',    brand: 'Canesten',   category: 's3-5', activeIngredient: 'Clotrimazole 1%',                                                               color: '#140F50', bgColor: '#A9DFBF' },
  { id: 'canesten-pessary',   name: 'Canesten Vaginal Pessary 500mg', brand: 'Canesten', category: 's3-5', activeIngredient: 'Clotrimazole 500mg',                                                             color: '#FFFFFF', bgColor: '#27AE60' },
  { id: 'monistat-1',         name: 'Monistat 1 Combination Pack',  brand: 'Monistat',   category: 's3-5', activeIngredient: 'Miconazole Nitrate 1200mg',                                                     color: '#FFFFFF', bgColor: '#1E8449' },

  // S3-6: Emergency contraception / Other S3
  { id: 'postinor-1',         name: 'Postinor-1',                   brand: 'Postinor',   category: 's3-6', activeIngredient: 'Levonorgestrel 1.5mg',                                                          color: '#FFFFFF', bgColor: '#884EA0' },
  { id: 'ella-one',           name: 'EllaOne 30mg',                 brand: 'EllaOne',    category: 's3-6', activeIngredient: 'Ulipristal Acetate 30mg',                                                       color: '#FFFFFF', bgColor: '#6C3483' },
  { id: 'next-choice',        name: 'Next Choice One Dose',         brand: 'Next Choice', category: 's3-6', activeIngredient: 'Levonorgestrel 1.5mg',                                                         color: '#140F50', bgColor: '#D7BDE2' },

  // === Skin ===
  { id: 'hydrocortisone-cream', name: 'Hydrocortisone Cream 1%',    brand: 'Generic',    category: 'skin', activeIngredient: 'Hydrocortisone 1%',                                                             color: '#FFFFFF', bgColor: '#F39C12' },
  { id: 'bepanthen',          name: 'Bepanthen Ointment',           brand: 'Bepanthen',  category: 'skin', activeIngredient: 'Dexpanthenol 5%',                                                               color: '#140F50', bgColor: '#F9E79F' },
  { id: 'pinetarsol-gel',     name: 'Pinetarsol Gel',               brand: 'Pinetarsol', category: 'skin', activeIngredient: 'Pine Tar Solution 25%',                                                         color: '#FFFFFF', bgColor: '#784212' },
  { id: 'eurax-cream',        name: 'Eurax Cream',                  brand: 'Eurax',      category: 'skin', activeIngredient: 'Crotamiton 10%',                                                                color: '#FFFFFF', bgColor: '#E59866' },
  { id: 'daktacort',          name: 'Daktacort Cream',              brand: 'Daktacort',  category: 'skin', activeIngredient: 'Miconazole Nitrate 2%, Hydrocortisone 1%',                                      color: '#FFFFFF', bgColor: '#CA6F1E' },
  { id: 'neutrogena-t-gel',   name: 'Neutrogena T/Gel Shampoo',     brand: 'Neutrogena', category: 'skin', activeIngredient: 'Coal Tar 0.5%',                                                                 color: '#140F50', bgColor: '#D5D8DC' },

  // === Smoking Cessation ===
  { id: 'nicorette-patch',    name: 'Nicorette Patch 16hr',         brand: 'Nicorette',  category: 'smoking', activeIngredient: 'Nicotine 15mg/16hr',                                                        color: '#FFFFFF', bgColor: '#2471A3' },
  { id: 'nicorette-gum',      name: 'Nicorette Gum 2mg',            brand: 'Nicorette',  category: 'smoking', activeIngredient: 'Nicotine (as polacrilex) 2mg',                                              color: '#FFFFFF', bgColor: '#1F618D' },
  { id: 'nicorette-inhaler',  name: 'Nicorette Inhaler',            brand: 'Nicorette',  category: 'smoking', activeIngredient: 'Nicotine 10mg/cartridge',                                                   color: '#FFFFFF', bgColor: '#154360' },
  { id: 'niquitin-clear',     name: 'NiQuitin Clear Patch',         brand: 'NiQuitin',   category: 'smoking', activeIngredient: 'Nicotine 21mg/24hr (Step 1)',                                                color: '#FFFFFF', bgColor: '#117A65' },
  { id: 'champix',            name: 'Champix 0.5mg/1mg Starter Pack', brand: 'Champix', category: 'smoking', activeIngredient: 'Varenicline Tartrate 0.5mg/1mg',                                             color: '#FFFFFF', bgColor: '#7D6608' },
]

// Helper exports
export const getProductsByShelf = (shelfId) => products.filter(p => p.category === shelfId)
export const getShelfById = (id) => shelves.find(s => s.id === id)
export const getAllProductIds = () => new Set(products.map(p => p.id))
