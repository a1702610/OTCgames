// OTC Games — Demo Module
// A pre-built training module covering Cold & Flu and Pain Management shelves.
// This file exports a content.json-shaped object for use as the default demo module.

export const demoModule = {
  version: '1.0',
  exportedAt: '2026-03-22T00:00:00.000Z',
  module: {
    name: 'Cold & Flu and Pain Management',
    description:
      'An introductory module covering common cold & flu preparations and OTC pain management products. ' +
      'Practice selecting the right product for the patient, and test your knowledge of active ingredients and counselling points.',
    selectedShelfIds: ['cold-flu-1', 'pain-1'],
  },
  shelves: [
    { id: 'cold-flu-1', label: 'Cold & Flu',     shelfNumber: 1, emoji: '🤧', color: '#4A90D9' },
    { id: 'pain-1',     label: 'Pain Management', shelfNumber: 1, emoji: '💊', color: '#E74C3C' },
  ],
  products: [
    // Cold & Flu Shelf 1 — selected subset
    {
      id: 'codral-original',
      name: 'Codral Original Day & Night',
      brand: 'Codral',
      category: 'cold-flu-1',
      activeIngredient: 'Paracetamol 500mg, Pseudoephedrine HCl 30mg, Dextromethorphan HBr 15mg',
      color: '#FFFFFF',
      bgColor: '#C0392B',
    },
    {
      id: 'codral-pe-free',
      name: 'Codral PE Free Cold & Flu',
      brand: 'Codral',
      category: 'cold-flu-1',
      activeIngredient: 'Paracetamol 500mg, Dextromethorphan HBr 15mg, Chlorpheniramine 2mg',
      color: '#FFFFFF',
      bgColor: '#E74C3C',
    },
    {
      id: 'lemsip-max',
      name: 'Lemsip Max All-in-One',
      brand: 'Lemsip',
      category: 'cold-flu-1',
      activeIngredient: 'Paracetamol 1000mg, Phenylephrine HCl 12.2mg, Caffeine 25mg',
      color: '#FFFFFF',
      bgColor: '#2980B9',
    },
    {
      id: 'dimetapp-cold',
      name: 'Dimetapp Cold & Allergy Elixir',
      brand: 'Dimetapp',
      category: 'cold-flu-1',
      activeIngredient: 'Brompheniramine Maleate 1mg/5mL, Phenylephrine HCl 2.5mg/5mL',
      color: '#FFFFFF',
      bgColor: '#9B59B6',
    },
    {
      id: 'robitussin-cf',
      name: 'Robitussin Chesty Cough & Nasal Congestion',
      brand: 'Robitussin',
      category: 'cold-flu-1',
      activeIngredient: 'Guaifenesin 100mg/5mL, Phenylephrine HCl 5mg/5mL',
      color: '#FFFFFF',
      bgColor: '#16A085',
    },

    // Pain Management Shelf 1 — selected subset
    {
      id: 'panadol-original',
      name: 'Panadol Original',
      brand: 'Panadol',
      category: 'pain-1',
      activeIngredient: 'Paracetamol 500mg',
      color: '#FFFFFF',
      bgColor: '#E74C3C',
    },
    {
      id: 'nurofen-original',
      name: 'Nurofen Original',
      brand: 'Nurofen',
      category: 'pain-1',
      activeIngredient: 'Ibuprofen 200mg',
      color: '#FFFFFF',
      bgColor: '#E67E22',
    },
    {
      id: 'aspirin-tablets',
      name: 'Aspirin 300mg Tablets',
      brand: 'Generic',
      category: 'pain-1',
      activeIngredient: 'Aspirin 300mg',
      color: '#140F50',
      bgColor: '#BDC3C7',
    },
  ],

  scenarios: [
    {
      id: 'demo-scenario-001',
      shelfId: 'cold-flu-1',
      patient: {
        name: 'Mrs Chen',
        avatarEmoji: '👩',
        description:
          'Mrs Chen, 34 years old, presents with a runny nose, sneezing and mild nasal congestion for the past two days. ' +
          'She mentions she has high blood pressure and is taking ramipril 5mg daily. She asks for something to help her feel better.',
      },
      bestChoiceProductId: 'codral-pe-free',
      acceptableProductIds: [],
      explanation:
        'Mrs Chen has hypertension, which is a contraindication to pseudoephedrine (Codral Original) and ALL phenylephrine-containing products ' +
        '(Lemsip Max, Robitussin CF, Dimetapp Cold). Codral PE Free is the ONLY safe choice: it contains paracetamol for symptomatic relief, ' +
        'dextromethorphan for cough suppression, and chlorpheniramine for runny nose and sneezing, with no sympathomimetic decongestant. ' +
        'All other products on this shelf contain either pseudoephedrine or phenylephrine and should be avoided for this patient. ' +
        'Robitussin CF contains phenylephrine and must be avoided — do not offer it as an alternative, regardless of dose.',
      followUpQuestion: null,
    },
    {
      id: 'demo-scenario-002',
      shelfId: 'pain-1',
      patient: {
        name: 'Mr Nguyen',
        avatarEmoji: '👨',
        description:
          'Mr Nguyen, 52 years old, is asking for something for his knee pain. He has a history of a peptic ulcer diagnosed three years ago, ' +
          'which is now healed. He takes a low-dose aspirin 100mg daily for cardiovascular protection. He rates his pain as 4/10.',
      },
      bestChoiceProductId: 'panadol-original',
      acceptableProductIds: [],
      explanation:
        'Paracetamol (Panadol Original) is the safest first-line analgesic for Mr Nguyen. ' +
        'NSAIDs such as ibuprofen (Nurofen Original) should be avoided due to his history of peptic ulcer disease and concurrent low-dose aspirin use, ' +
        'which significantly increases the risk of GI bleeding. Additional aspirin (Aspirin 300mg) would be inappropriate as he is already on aspirin ' +
        'therapy and the combination increases bleeding risk without additional analgesic benefit for musculoskeletal pain. ' +
        'Counsel him to take paracetamol 500–1000mg every 4–6 hours as needed (max 4g/day), and to apply a cold or warm pack to the knee.',
      followUpQuestion: null,
    },
  ],

  quizQuestions: [
    {
      id: 'demo-quiz-001',
      type: 'mcq',
      shelfId: 'cold-flu-1',
      question:
        'A customer with uncontrolled hypertension asks for an OTC cold & flu product. Which of the following active ingredients is CONTRAINDICATED in this patient?',
      options: [
        'Paracetamol 500mg',
        'Pseudoephedrine HCl 30mg',
        'Dextromethorphan HBr 15mg',
        'Chlorpheniramine 2mg',
      ],
      correctIndex: 1,
      explanation:
        'Pseudoephedrine is a sympathomimetic decongestant that stimulates alpha-adrenergic receptors, causing vasoconstriction and raising blood pressure. ' +
        'It is contraindicated in patients with hypertension, ischaemic heart disease, and those taking MAOIs. ' +
        'Paracetamol, dextromethorphan and chlorpheniramine do not have significant cardiovascular effects and are generally safe to use in hypertensive patients.',
    },
    {
      id: 'demo-quiz-002',
      type: 'truefalse',
      shelfId: 'pain-1',
      statement:
        'Ibuprofen (Nurofen) is a safer choice than paracetamol (Panadol) for a patient who regularly drinks alcohol.',
      correctAnswer: false,
      explanation:
        'False. Paracetamol is generally the preferred analgesic in patients who consume alcohol, provided they stay within the recommended dose (max 4g/day for healthy adults, lower for heavy drinkers). ' +
        'Ibuprofen and other NSAIDs increase the risk of gastric ulceration and GI bleeding, which is potentiated by alcohol. ' +
        'However, patients who consume more than 3 standard drinks per day should be referred to their GP, as high alcohol intake also increases the risk of paracetamol hepatotoxicity.',
    },
    {
      id: 'demo-quiz-003',
      type: 'dragdrop',
      shelfId: 'cold-flu-1',
      instruction:
        'Drag each product into the correct category based on its primary mechanism of action. Products that do not fit either category should be left unassigned.',
      categories: [
        { id: 'cat-decongestant',   label: 'Sympathomimetic Decongestant', color: '#E74C3C' },
        { id: 'cat-antihistamine',  label: 'Sedating Antihistamine',       color: '#9B59B6' },
      ],
      productAssignments: [
        { productId: 'codral-original', categoryId: 'cat-decongestant' },
        { productId: 'dimetapp-cold',   categoryId: 'cat-antihistamine' },
        { productId: 'codral-pe-free',  categoryId: 'cat-antihistamine' },
        { productId: 'lemsip-max',      categoryId: 'cat-decongestant' },
        { productId: 'robitussin-cf',   categoryId: null },
      ],
      explanation:
        'Codral Original contains pseudoephedrine and Lemsip Max contains phenylephrine — both are sympathomimetic decongestants that work by stimulating alpha-adrenergic receptors to reduce nasal mucosal swelling. ' +
        'Dimetapp Cold contains brompheniramine and Codral PE Free contains chlorpheniramine — both are first-generation (sedating) antihistamines that relieve runny nose and sneezing by blocking H1 receptors. ' +
        'Robitussin CF contains guaifenesin (an expectorant) as its primary ingredient, which does not fit either decongestant or antihistamine categories — its primary action is to loosen mucus. ' +
        'Note: Robitussin CF also contains Phenylephrine, a sympathomimetic decongestant. However, because its primary mechanism is expectorant action via guaifenesin, it was categorised separately here. In practice, its phenylephrine content should be considered when counselling patients with cardiovascular concerns.',
    },
  ],
}
