// Breed-specific health concern data for onboarding education step
// ~50 common breeds with 3-4 health concerns each
// No fabricated statistics — tangible descriptions only

export interface BreedHealthConcern {
  title: string;
  description: string;
  icon: string; // MaterialCommunityIcons name
}

const BREED_HEALTH_MAP: Record<string, BreedHealthConcern[]> = {
  'golden retriever': [
    { title: 'Hip & Elbow Dysplasia', description: 'Joint issues that can cause stiffness, limping, or difficulty rising — especially as they age.', icon: 'bone' },
    { title: 'Heart Conditions', description: 'Golden Retrievers can develop subvalvular aortic stenosis. Watch for exercise intolerance or unusual fatigue.', icon: 'heart-pulse' },
    { title: 'Skin Allergies', description: 'Prone to hot spots and seasonal allergies that cause scratching, redness, or ear infections.', icon: 'allergy' },
    { title: 'Cancer Risk', description: 'One of the breeds with higher cancer incidence. Early detection through regular vet exams is key.', icon: 'shield-alert-outline' },
  ],
  'labrador retriever': [
    { title: 'Hip & Elbow Dysplasia', description: 'Joint problems that can develop with age, especially in overweight dogs.', icon: 'bone' },
    { title: 'Obesity', description: 'Labs love food and gain weight easily. Appetite tracking helps catch overfeeding early.', icon: 'scale-bathroom' },
    { title: 'Exercise-Induced Collapse', description: 'Some Labs carry a gene causing weakness after intense exercise. Monitor energy levels closely.', icon: 'run-fast' },
    { title: 'Ear Infections', description: 'Floppy ears trap moisture. Watch for head shaking, scratching, or unusual odor.', icon: 'ear-hearing' },
  ],
  'german shepherd': [
    { title: 'Hip Dysplasia', description: 'Very common in the breed. Watch for stiffness, bunny-hopping gait, or reluctance to climb stairs.', icon: 'bone' },
    { title: 'Degenerative Myelopathy', description: 'Progressive nerve condition affecting hind legs. Early mobility tracking can help detect subtle changes.', icon: 'wheelchair-accessibility' },
    { title: 'Digestive Sensitivity', description: 'Prone to bloat (GDV) and sensitive stomachs. Monitor stool quality and eating habits daily.', icon: 'stomach' },
    { title: 'Skin Issues', description: 'Allergies and hot spots are common. Track scratching patterns to identify triggers.', icon: 'allergy' },
  ],
  'french bulldog': [
    { title: 'Breathing Difficulties', description: 'Flat-faced breed prone to BVAS. Watch for excessive panting, snoring, or exercise intolerance.', icon: 'lungs' },
    { title: 'Spinal Problems', description: 'IVDD can cause back pain or sudden paralysis. Monitor mobility changes carefully.', icon: 'spine' },
    { title: 'Skin Fold Infections', description: 'Wrinkles trap moisture and bacteria. Watch for redness, odor, or scratching around folds.', icon: 'allergy' },
    { title: 'Heat Sensitivity', description: 'Cannot regulate temperature well. Lethargy or heavy panting in warm weather is a warning sign.', icon: 'thermometer-alert' },
  ],
  'bulldog': [
    { title: 'Breathing Issues', description: 'Brachycephalic breed with compromised airways. Monitor for labored breathing and exercise intolerance.', icon: 'lungs' },
    { title: 'Joint Problems', description: 'Prone to hip dysplasia and patellar luxation. Track mobility and willingness to walk.', icon: 'bone' },
    { title: 'Skin Fold Dermatitis', description: 'Wrinkles need daily attention. Watch for redness, moisture, or unusual smell.', icon: 'allergy' },
    { title: 'Cherry Eye', description: 'The third eyelid gland can prolapse. Watch for red swelling in the corner of the eye.', icon: 'eye-outline' },
  ],
  'poodle': [
    { title: 'Hip Dysplasia', description: 'Especially in Standard Poodles. Watch for stiffness after rest or reluctance to jump.', icon: 'bone' },
    { title: 'Eye Conditions', description: 'Prone to progressive retinal atrophy and cataracts. Watch for bumping into things or hesitation in dim light.', icon: 'eye-outline' },
    { title: 'Addison\'s Disease', description: 'Adrenal gland insufficiency causing lethargy, vomiting, or appetite loss. Track energy patterns over time.', icon: 'medical-bag' },
    { title: 'Bloat Risk', description: 'Standard Poodles are at risk for gastric torsion. Monitor eating speed and post-meal behavior.', icon: 'stomach' },
  ],
  'beagle': [
    { title: 'Obesity', description: 'Beagles are food-driven and gain weight easily. Daily appetite tracking helps catch overfeeding.', icon: 'scale-bathroom' },
    { title: 'Ear Infections', description: 'Long, floppy ears are prone to infections. Watch for scratching, head tilting, or odor.', icon: 'ear-hearing' },
    { title: 'Epilepsy', description: 'More common in Beagles than many breeds. Track any unusual episodes or behavioral changes.', icon: 'flash-alert' },
    { title: 'Intervertebral Disc Disease', description: 'Back problems that can cause pain or mobility issues. Monitor for reluctance to jump.', icon: 'spine' },
  ],
  'rottweiler': [
    { title: 'Hip & Elbow Dysplasia', description: 'Large breed prone to joint problems. Track mobility patterns as they age.', icon: 'bone' },
    { title: 'Heart Conditions', description: 'Prone to aortic stenosis and cardiomyopathy. Watch for exercise intolerance or coughing.', icon: 'heart-pulse' },
    { title: 'Cancer Risk', description: 'Higher incidence of bone cancer (osteosarcoma). Limping or swelling warrants prompt vet attention.', icon: 'shield-alert-outline' },
    { title: 'Bloat', description: 'Deep-chested breed at risk for gastric torsion. Monitor eating behavior and post-meal restlessness.', icon: 'stomach' },
  ],
  'yorkshire terrier': [
    { title: 'Dental Disease', description: 'Small mouths are prone to crowded teeth and decay. Watch for bad breath or difficulty eating.', icon: 'tooth-outline' },
    { title: 'Luxating Patella', description: 'Kneecap slipping is common in small breeds. Watch for skipping steps or holding a leg up.', icon: 'bone' },
    { title: 'Hypoglycemia', description: 'Low blood sugar can cause weakness or trembling, especially in puppies. Track energy and appetite.', icon: 'water-outline' },
    { title: 'Tracheal Collapse', description: 'Weakened windpipe causing a honking cough. Monitor for coughing during excitement or exercise.', icon: 'lungs' },
  ],
  'dachshund': [
    { title: 'IVDD (Back Problems)', description: 'Long spine makes them highly prone to disc issues. Any reluctance to move or yelping needs attention.', icon: 'spine' },
    { title: 'Obesity', description: 'Extra weight stresses their long spine dramatically. Weight tracking is especially critical.', icon: 'scale-bathroom' },
    { title: 'Dental Disease', description: 'Small mouths crowd teeth. Watch for bad breath, drooling, or reluctance to chew.', icon: 'tooth-outline' },
    { title: 'Luxating Patella', description: 'Kneecap displacement common in miniature variety. Watch for intermittent limping.', icon: 'bone' },
  ],
  'boxer': [
    { title: 'Cancer Risk', description: 'Boxers have higher rates of mast cell tumors and lymphoma. Check for new lumps regularly.', icon: 'shield-alert-outline' },
    { title: 'Heart Conditions', description: 'Prone to boxer cardiomyopathy and aortic stenosis. Watch for fainting, weakness, or exercise intolerance.', icon: 'heart-pulse' },
    { title: 'Hip Dysplasia', description: 'Joint issues that can develop as they grow. Monitor for stiffness or difficulty rising.', icon: 'bone' },
    { title: 'Brachycephalic Issues', description: 'Shortened muzzle can cause breathing difficulties, especially in heat.', icon: 'lungs' },
  ],
  'siberian husky': [
    { title: 'Eye Conditions', description: 'Prone to cataracts, corneal dystrophy, and progressive retinal atrophy. Watch for cloudiness or vision changes.', icon: 'eye-outline' },
    { title: 'Hip Dysplasia', description: 'Active breed but still susceptible. Watch for any changes in gait or exercise enthusiasm.', icon: 'bone' },
    { title: 'Autoimmune Conditions', description: 'Prone to skin conditions like zinc-responsive dermatosis. Track any skin or coat changes.', icon: 'allergy' },
    { title: 'Hypothyroidism', description: 'Can cause weight gain, lethargy, and coat changes. Track energy and weight patterns.', icon: 'medical-bag' },
  ],
  'great dane': [
    { title: 'Bloat (GDV)', description: 'Extremely high risk breed. Watch for restlessness, drooling, or attempts to vomit after eating.', icon: 'stomach' },
    { title: 'Heart Disease', description: 'Dilated cardiomyopathy is common. Monitor exercise tolerance and watch for coughing.', icon: 'heart-pulse' },
    { title: 'Hip Dysplasia', description: 'Giant breed joints bear enormous stress. Track mobility patterns as they grow.', icon: 'bone' },
    { title: 'Bone Cancer', description: 'Higher osteosarcoma risk. Any persistent limping or swelling should be checked promptly.', icon: 'shield-alert-outline' },
  ],
  'doberman pinscher': [
    { title: 'Dilated Cardiomyopathy', description: 'Very common in Dobermans. Watch for coughing, fatigue, or fainting.', icon: 'heart-pulse' },
    { title: 'Von Willebrand\'s Disease', description: 'Bleeding disorder affecting clotting. Watch for prolonged bleeding from minor cuts.', icon: 'water-outline' },
    { title: 'Hip Dysplasia', description: 'Can develop joint issues with age. Monitor mobility and willingness to exercise.', icon: 'bone' },
    { title: 'Hypothyroidism', description: 'Can cause lethargy, weight gain, and skin problems. Daily energy tracking helps detect changes.', icon: 'medical-bag' },
  ],
  'shih tzu': [
    { title: 'Eye Problems', description: 'Protruding eyes are prone to injury, dryness, and ulcers. Watch for squinting or discharge.', icon: 'eye-outline' },
    { title: 'Breathing Difficulties', description: 'Brachycephalic breed that can overheat easily. Monitor breathing, especially in warm weather.', icon: 'lungs' },
    { title: 'Dental Disease', description: 'Small mouth leads to crowded teeth. Watch for bad breath or difficulty eating.', icon: 'tooth-outline' },
    { title: 'Ear Infections', description: 'Dense ear hair traps moisture. Watch for scratching, head shaking, or odor.', icon: 'ear-hearing' },
  ],
  'australian shepherd': [
    { title: 'Hip Dysplasia', description: 'Active breed but still prone to joint issues. Track any changes in exercise enthusiasm.', icon: 'bone' },
    { title: 'Eye Conditions', description: 'Prone to cataracts, colobomas, and progressive retinal atrophy. Regular eye checks are important.', icon: 'eye-outline' },
    { title: 'Epilepsy', description: 'Higher seizure risk than average. Track any unusual episodes or behavioral changes.', icon: 'flash-alert' },
    { title: 'MDR1 Gene Sensitivity', description: 'Many Aussies are sensitive to certain medications. Always inform your vet of the breed.', icon: 'pill' },
  ],
  'cavalier king charles spaniel': [
    { title: 'Heart Disease (MVD)', description: 'Nearly all Cavaliers develop mitral valve disease. Watch for coughing, fatigue, or breathing changes.', icon: 'heart-pulse' },
    { title: 'Syringomyelia', description: 'Skull too small for brain, causing neck pain. Watch for scratching at air near the neck.', icon: 'head-outline' },
    { title: 'Eye Conditions', description: 'Prone to cataracts and dry eye. Watch for cloudiness or excessive blinking.', icon: 'eye-outline' },
    { title: 'Ear Infections', description: 'Long, heavy ears trap moisture. Monitor for scratching or odor.', icon: 'ear-hearing' },
  ],
  'miniature schnauzer': [
    { title: 'Pancreatitis', description: 'Prone to pancreatic inflammation from fatty foods. Monitor appetite and stool quality closely.', icon: 'stomach' },
    { title: 'Urinary Stones', description: 'Higher risk of bladder stones. Watch for straining to urinate or blood in urine.', icon: 'water-outline' },
    { title: 'Eye Conditions', description: 'Prone to cataracts and progressive retinal atrophy. Watch for vision changes.', icon: 'eye-outline' },
    { title: 'Skin Conditions', description: 'Can develop comedone syndrome (blackheads along the spine). Track skin changes.', icon: 'allergy' },
  ],
  'chihuahua': [
    { title: 'Dental Disease', description: 'Tiny mouths are extremely prone to dental issues. Watch for bad breath or refusal to eat hard food.', icon: 'tooth-outline' },
    { title: 'Luxating Patella', description: 'Kneecap slipping is very common. Watch for skipping or holding up a back leg.', icon: 'bone' },
    { title: 'Hypoglycemia', description: 'Tiny body size means low blood sugar risk. Monitor energy closely, especially in puppies.', icon: 'water-outline' },
    { title: 'Heart Conditions', description: 'Prone to patent ductus arteriosus and mitral valve disease. Track energy and breathing.', icon: 'heart-pulse' },
  ],
  'pug': [
    { title: 'Breathing Difficulties', description: 'Severe brachycephalic breed. Excessive panting, snoring, or exercise intolerance needs monitoring.', icon: 'lungs' },
    { title: 'Eye Injuries', description: 'Protruding eyes are easily scratched or injured. Watch for squinting, tearing, or redness.', icon: 'eye-outline' },
    { title: 'Obesity', description: 'Pugs love food and gain weight quickly, worsening breathing problems. Track appetite carefully.', icon: 'scale-bathroom' },
    { title: 'Skin Fold Infections', description: 'Facial wrinkles need daily cleaning. Watch for redness, moisture, or smell.', icon: 'allergy' },
  ],
  'cocker spaniel': [
    { title: 'Ear Infections', description: 'Long, pendulous ears are highly prone to chronic infections. Watch for scratching or odor.', icon: 'ear-hearing' },
    { title: 'Eye Conditions', description: 'Prone to cataracts, glaucoma, and cherry eye. Watch for cloudiness or redness.', icon: 'eye-outline' },
    { title: 'Hip Dysplasia', description: 'Can develop joint issues with age. Monitor for stiffness or reluctance to jump.', icon: 'bone' },
    { title: 'Skin Allergies', description: 'Prone to seborrhea and allergic dermatitis. Track scratching and coat condition.', icon: 'allergy' },
  ],
  'border collie': [
    { title: 'Hip Dysplasia', description: 'Even this athletic breed is susceptible. Watch for subtle gait changes during herding or play.', icon: 'bone' },
    { title: 'Eye Conditions', description: 'Prone to Collie Eye Anomaly and progressive retinal atrophy. Regular eye exams recommended.', icon: 'eye-outline' },
    { title: 'Epilepsy', description: 'Higher seizure incidence than average. Track any episodes or unusual behavior.', icon: 'flash-alert' },
    { title: 'Osteochondrosis', description: 'Joint cartilage issues during growth. Monitor puppy mobility closely.', icon: 'bone' },
  ],
  'pembroke welsh corgi': [
    { title: 'IVDD (Back Problems)', description: 'Long spine with short legs increases disc disease risk. Watch for yelping or reluctance to move.', icon: 'spine' },
    { title: 'Hip Dysplasia', description: 'Common despite their small size. Monitor for stiffness or bunny-hopping gait.', icon: 'bone' },
    { title: 'Obesity', description: 'Corgis gain weight easily, which stresses their back. Appetite and weight tracking is critical.', icon: 'scale-bathroom' },
    { title: 'Eye Conditions', description: 'Prone to progressive retinal atrophy and cataracts. Watch for vision changes.', icon: 'eye-outline' },
  ],
  'german shorthaired pointer': [
    { title: 'Hip Dysplasia', description: 'Active hunting breed but still prone to joint issues. Track any lameness after exercise.', icon: 'bone' },
    { title: 'Bloat (GDV)', description: 'Deep-chested breed at risk. Watch for restlessness or unproductive retching after meals.', icon: 'stomach' },
    { title: 'Eye Conditions', description: 'Prone to cone degeneration and entropion. Watch for squinting or light sensitivity.', icon: 'eye-outline' },
    { title: 'Cancer Risk', description: 'Higher incidence of certain cancers. Regular vet check-ups and lump monitoring recommended.', icon: 'shield-alert-outline' },
  ],
  'bernese mountain dog': [
    { title: 'Cancer Risk', description: 'Unfortunately high cancer rates, especially histiocytic sarcoma. Regular vet exams are essential.', icon: 'shield-alert-outline' },
    { title: 'Hip & Elbow Dysplasia', description: 'Giant breed with significant joint risk. Track mobility changes as they grow.', icon: 'bone' },
    { title: 'Bloat', description: 'Large, deep-chested breed at risk for gastric torsion. Monitor eating and post-meal behavior.', icon: 'stomach' },
    { title: 'Von Willebrand\'s Disease', description: 'Bleeding disorder affecting clotting. Watch for unusual bleeding or bruising.', icon: 'water-outline' },
  ],
  'maltese': [
    { title: 'Dental Disease', description: 'Small breed with crowded teeth prone to decay. Watch for bad breath or eating changes.', icon: 'tooth-outline' },
    { title: 'Luxating Patella', description: 'Kneecap displacement common in toy breeds. Watch for intermittent limping.', icon: 'bone' },
    { title: 'Tracheal Collapse', description: 'Weakened windpipe causing coughing. Use a harness instead of collar for walks.', icon: 'lungs' },
    { title: 'Eye Staining', description: 'Tear staining and eye irritation are common. Watch for excessive tearing or discharge.', icon: 'eye-outline' },
  ],
  'pomeranian': [
    { title: 'Luxating Patella', description: 'Very common in Poms. Watch for skipping, holding up a leg, or sudden yelping.', icon: 'bone' },
    { title: 'Tracheal Collapse', description: 'Weakened windpipe causing a goose-honk cough. Monitor during excitement or exercise.', icon: 'lungs' },
    { title: 'Dental Disease', description: 'Tiny mouth means crowded teeth and high decay risk. Track eating habits.', icon: 'tooth-outline' },
    { title: 'Alopecia X', description: 'Coat loss condition specific to Poms. Watch for thinning or bald patches.', icon: 'allergy' },
  ],
  'shetland sheepdog': [
    { title: 'Collie Eye Anomaly', description: 'Inherited eye condition. Regular eye exams recommended from puppyhood.', icon: 'eye-outline' },
    { title: 'Hip Dysplasia', description: 'Can develop joint issues. Monitor for stiffness or reluctance to exercise.', icon: 'bone' },
    { title: 'Thyroid Issues', description: 'Prone to hypothyroidism causing weight gain and lethargy. Track energy patterns.', icon: 'medical-bag' },
    { title: 'Dermatomyositis', description: 'Skin and muscle inflammation, especially in young dogs. Watch for facial lesions.', icon: 'allergy' },
  ],
  'boston terrier': [
    { title: 'Breathing Difficulties', description: 'Brachycephalic breed prone to respiratory issues. Monitor for excessive panting or snoring.', icon: 'lungs' },
    { title: 'Eye Problems', description: 'Prominent eyes are easily injured. Watch for redness, squinting, or discharge.', icon: 'eye-outline' },
    { title: 'Luxating Patella', description: 'Kneecap issues common in the breed. Watch for intermittent limping.', icon: 'bone' },
    { title: 'Deafness', description: 'White-coated Bostons have higher deafness risk. Test response to sounds regularly.', icon: 'ear-hearing' },
  ],
  'havanese': [
    { title: 'Luxating Patella', description: 'Common in small breeds. Watch for skipping steps or holding up a leg.', icon: 'bone' },
    { title: 'Eye Conditions', description: 'Prone to cataracts and progressive retinal atrophy. Watch for cloudiness.', icon: 'eye-outline' },
    { title: 'Ear Infections', description: 'Hairy ear canals trap debris. Watch for head shaking or scratching.', icon: 'ear-hearing' },
    { title: 'Hip Dysplasia', description: 'Surprisingly common despite small size. Monitor for stiffness.', icon: 'bone' },
  ],
  'english springer spaniel': [
    { title: 'Hip Dysplasia', description: 'Active sporting breed but still susceptible. Track mobility changes.', icon: 'bone' },
    { title: 'Eye Conditions', description: 'Prone to progressive retinal atrophy and retinal dysplasia.', icon: 'eye-outline' },
    { title: 'Ear Infections', description: 'Pendulous ears trap moisture. Monitor for scratching or odor.', icon: 'ear-hearing' },
    { title: 'Phosphofructokinase Deficiency', description: 'Metabolic disorder causing exercise intolerance. Track energy after activity.', icon: 'run-fast' },
  ],
  'brittany': [
    { title: 'Hip Dysplasia', description: 'Active breed but joint issues can develop. Monitor mobility during and after exercise.', icon: 'bone' },
    { title: 'Epilepsy', description: 'Higher seizure risk. Track any unusual behavioral episodes.', icon: 'flash-alert' },
    { title: 'Hypothyroidism', description: 'Can cause weight gain and lethargy. Daily energy tracking helps detect early changes.', icon: 'medical-bag' },
  ],
  'weimaraner': [
    { title: 'Bloat (GDV)', description: 'Deep-chested breed at risk. Watch for unproductive retching or abdominal distension.', icon: 'stomach' },
    { title: 'Hip Dysplasia', description: 'Large active breed with joint vulnerability. Track lameness patterns.', icon: 'bone' },
    { title: 'Separation Anxiety', description: 'Notoriously anxious when alone. Track mood and behavioral changes.', icon: 'emoticon-sad-outline' },
  ],
  'vizsla': [
    { title: 'Hip Dysplasia', description: 'Athletic breed but still susceptible to joint issues. Monitor for lameness.', icon: 'bone' },
    { title: 'Epilepsy', description: 'Higher seizure incidence. Track any episodes of unusual behavior.', icon: 'flash-alert' },
    { title: 'Eye Conditions', description: 'Prone to entropion and progressive retinal atrophy.', icon: 'eye-outline' },
  ],
  'mastiff': [
    { title: 'Bloat (GDV)', description: 'Giant, deep-chested breed with very high bloat risk. Monitor post-meal behavior closely.', icon: 'stomach' },
    { title: 'Hip & Elbow Dysplasia', description: 'Enormous weight stresses joints. Track mobility as they grow.', icon: 'bone' },
    { title: 'Heart Disease', description: 'Prone to cardiomyopathy. Watch for exercise intolerance or coughing.', icon: 'heart-pulse' },
  ],
  'newfoundland': [
    { title: 'Heart Disease', description: 'Subvalvular aortic stenosis is common. Watch for exercise intolerance and fatigue.', icon: 'heart-pulse' },
    { title: 'Hip & Elbow Dysplasia', description: 'Giant breed with high joint stress. Track mobility patterns.', icon: 'bone' },
    { title: 'Bloat', description: 'Deep-chested breed at risk for gastric torsion. Monitor eating behavior.', icon: 'stomach' },
  ],
  'saint bernard': [
    { title: 'Hip & Elbow Dysplasia', description: 'Giant breed with significant joint risk. Monitor mobility from puppyhood.', icon: 'bone' },
    { title: 'Bloat', description: 'Very deep-chested with high bloat risk. Watch for restlessness after meals.', icon: 'stomach' },
    { title: 'Heart Conditions', description: 'Prone to dilated cardiomyopathy. Track energy levels and exercise tolerance.', icon: 'heart-pulse' },
  ],
  'bichon frise': [
    { title: 'Dental Disease', description: 'Small mouth with crowded teeth. Watch for bad breath or eating changes.', icon: 'tooth-outline' },
    { title: 'Allergies', description: 'Prone to skin allergies causing itching and ear infections. Track scratching patterns.', icon: 'allergy' },
    { title: 'Luxating Patella', description: 'Kneecap issues common in small breeds. Watch for intermittent limping.', icon: 'bone' },
  ],
  'west highland white terrier': [
    { title: 'Skin Allergies', description: 'Westies are highly prone to atopic dermatitis. Track scratching intensity daily.', icon: 'allergy' },
    { title: 'Luxating Patella', description: 'Kneecap displacement common in the breed. Watch for leg-holding.', icon: 'bone' },
    { title: 'Liver Disease', description: 'Prone to copper toxicosis. Watch for appetite loss, vomiting, or lethargy.', icon: 'medical-bag' },
  ],
  'akita': [
    { title: 'Hip Dysplasia', description: 'Large breed with joint vulnerability. Monitor for stiffness or gait changes.', icon: 'bone' },
    { title: 'Autoimmune Conditions', description: 'Prone to autoimmune thyroiditis and skin conditions. Track coat and energy changes.', icon: 'allergy' },
    { title: 'Bloat', description: 'Deep-chested breed at risk. Watch for post-meal restlessness or retching.', icon: 'stomach' },
  ],
  'basset hound': [
    { title: 'Ear Infections', description: 'Extremely long ears trap moisture and bacteria. Monitor for odor and scratching.', icon: 'ear-hearing' },
    { title: 'IVDD (Back Problems)', description: 'Long spine is vulnerable to disc issues. Watch for yelping or mobility changes.', icon: 'spine' },
    { title: 'Obesity', description: 'Bassets gain weight easily. Extra weight worsens back problems dramatically.', icon: 'scale-bathroom' },
  ],
  'bloodhound': [
    { title: 'Bloat (GDV)', description: 'Very deep-chested breed with high risk. Monitor for drooling, pacing, or retching after meals.', icon: 'stomach' },
    { title: 'Ear Infections', description: 'Long, heavy ears are extremely prone to chronic infections.', icon: 'ear-hearing' },
    { title: 'Hip & Elbow Dysplasia', description: 'Large breed with significant joint stress. Track mobility patterns.', icon: 'bone' },
  ],
  'cane corso': [
    { title: 'Hip Dysplasia', description: 'Large powerful breed prone to joint issues. Monitor mobility as they mature.', icon: 'bone' },
    { title: 'Bloat', description: 'Deep-chested breed at risk for gastric torsion. Watch post-meal behavior.', icon: 'stomach' },
    { title: 'Eye Conditions', description: 'Prone to entropion and cherry eye. Watch for squinting or redness.', icon: 'eye-outline' },
  ],
  'rhodesian ridgeback': [
    { title: 'Hip & Elbow Dysplasia', description: 'Athletic large breed but still susceptible. Track any exercise reluctance.', icon: 'bone' },
    { title: 'Dermoid Sinus', description: 'Neural tube defect along the ridge. Watch for swelling or infection along the spine.', icon: 'spine' },
    { title: 'Hypothyroidism', description: 'Can cause weight gain and lethargy. Track energy levels daily.', icon: 'medical-bag' },
  ],
  'australian cattle dog': [
    { title: 'Hip Dysplasia', description: 'Working breed susceptible to joint wear. Monitor mobility changes.', icon: 'bone' },
    { title: 'Progressive Retinal Atrophy', description: 'Inherited eye condition causing gradual vision loss. Watch for night blindness.', icon: 'eye-outline' },
    { title: 'Deafness', description: 'Linked to the breed\'s coat color genetics. Test hearing response regularly.', icon: 'ear-hearing' },
  ],
  'whippet': [
    { title: 'Heart Murmurs', description: 'Common in sighthounds. Most are benign but should be monitored.', icon: 'heart-pulse' },
    { title: 'Eye Conditions', description: 'Prone to progressive retinal atrophy. Watch for vision changes in dim light.', icon: 'eye-outline' },
    { title: 'Thin Skin Injuries', description: 'Very thin skin tears easily. Monitor for cuts or lacerations after play.', icon: 'allergy' },
  ],
  'italian greyhound': [
    { title: 'Bone Fractures', description: 'Very delicate legs are prone to breaks from jumping. Monitor for limping.', icon: 'bone' },
    { title: 'Dental Disease', description: 'Extremely prone to periodontal disease. Daily dental care is essential.', icon: 'tooth-outline' },
    { title: 'Hypothyroidism', description: 'Can cause weight gain and lethargy. Track energy patterns.', icon: 'medical-bag' },
  ],
};

const GENERIC_CONCERNS: BreedHealthConcern[] = [
  { title: 'Joint Health', description: 'All dogs can develop joint issues with age. Daily mobility tracking helps catch changes early.', icon: 'bone' },
  { title: 'Dental Health', description: 'Dental disease affects most dogs by age three. Watch for bad breath or changes in eating.', icon: 'tooth-outline' },
  { title: 'Weight Management', description: 'Maintaining healthy weight prevents many health problems. Track appetite patterns daily.', icon: 'scale-bathroom' },
  { title: 'Digestive Health', description: 'Sudden diet changes or stress can cause digestive upset. Monitor stool quality and appetite.', icon: 'stomach' },
];

/**
 * Returns breed-specific health concerns for the given breed.
 * Falls back to generic concerns for unknown breeds.
 * Case-insensitive, trimmed matching.
 */
export function getBreedHealthConcerns(breed: string): BreedHealthConcern[] {
  if (!breed || !breed.trim()) return GENERIC_CONCERNS;

  const normalized = breed.trim().toLowerCase();

  // Direct match
  if (BREED_HEALTH_MAP[normalized]) {
    return BREED_HEALTH_MAP[normalized];
  }

  // Partial match — check if any key is contained in the input or vice versa
  for (const key of Object.keys(BREED_HEALTH_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return BREED_HEALTH_MAP[key];
    }
  }

  return GENERIC_CONCERNS;
}
