# RAG Corpus Expansion Plan

**Goal:** Expand `dog_health_content` from 303 to 500+ chunks
**Priority:** Address stress test Tier 2 failures (Cat 9 breed context, Cat 12 source attribution)
**Timeline:** Post-beta, pre-launch

---

## Current State (303 chunks)

| Category | Chunks | Sources | Assessment |
|----------|--------|---------|------------|
| general | 128 | 7 | Adequate |
| nutrition | 42 | 3 | Adequate |
| behavior | 24 | 5 | Adequate |
| surgery | 23 | 1 | OK, needs more sources |
| orthopedics | 21 | 3 | OK |
| preventive | 16 | 7 | OK |
| disease | 14 | 5 | Light |
| oncology | 8 | 1 | Light |
| dermatology | 8 | 2 | Light |
| respiratory | 5 | 1 | **Gap** |
| neurology | 3 | 1 | **Gap** |
| emergency | 3 | 1 | **Critical gap** |
| hepatic | 2 | 1 | **Gap** |
| thoracic | 2 | 1 | **Gap** |
| urinary | 2 | 1 | **Gap** |
| urology | 1 | 1 | **Gap** |
| reproductive | 1 | 1 | **Gap** |
| toxicology | 0 | 0 | **Missing entirely** |
| breed-specific | 0 | 0 | **Missing entirely** |
| foreign-body | 0 | 0 | **Missing entirely** |

## Priority 1: Safety-Critical Gaps (~100 new chunks)

These directly address stress test failures and the Golden Rule.

### 1a. Emergency Content (target: +30 chunks)
Current: 3 chunks. Needed for: general emergency triage content, when to go to ER vs wait.

**Topics to cover:**
- Signs of a true emergency (ABC: airway, breathing, circulation)
- GDV/bloat recognition and urgency
- Heatstroke signs and first aid
- Hypothermia signs
- Seizure first aid and post-ictal care
- Trauma assessment (hit by car, fall from height)
- Anaphylaxis signs
- Shock recognition (pale gums, rapid breathing, weak pulse)
- Choking first aid
- When to go to emergency vet vs wait for regular vet

**Source targets:** AVMA, ACVS, VCA Hospitals, Merck Veterinary Manual

### 1b. Toxicology Content (target: +30 chunks)
Current: 0 chunks. Critical for Cat 3 (toxin ingestion) source attribution.

**Topics to cover:**
- Chocolate toxicity (theobromine levels by type)
- Xylitol/birch sugar toxicity
- Grape/raisin toxicity
- Onion/garlic toxicity
- NSAID toxicity (ibuprofen, naproxen)
- Acetaminophen toxicity
- Antifreeze/ethylene glycol
- Rat poison/rodenticide types (anticoagulant, bromethalin, cholecalciferol)
- Snail bait/metaldehyde
- Marijuana/THC toxicity
- Lily toxicity (primarily cats, but dogs too)
- Sago palm toxicity
- Household chemical ingestion (bleach, detergent pods)
- Mushroom toxicity
- Common plants toxic to dogs

**Source targets:** ASPCA Animal Poison Control, Pet Poison Helpline, AVMA, Merck Vet Manual

### 1c. Foreign Body Content (target: +15 chunks)
Current: 0 chunks. Directly supports v10 foreign body ingestion rule.

**Topics to cover:**
- Types of foreign bodies (linear vs non-linear)
- Signs of GI obstruction (vomiting, lethargy, loss of appetite, abdominal pain)
- Timeline of concern (when ingestion becomes emergency)
- Linear foreign bodies (string, thread, ribbon) — why they're especially dangerous
- Battery ingestion — chemical burn risk
- Magnet ingestion — perforation risk from multiple magnets
- Bone fragments — splintering and perforation
- Sock/fabric ingestion — common in puppies
- Corn cob ingestion — common BBQ hazard
- When imaging is needed vs watchful waiting
- What to tell the vet about foreign body ingestion

**Source targets:** ACVS, VCA Hospitals, Merck Vet Manual

### 1d. Breed-Specific Emergencies (target: +25 chunks)
Current: 0 chunks. Directly addresses Cat 9 (breed context) failures.

**Topics to cover:**
- Deep-chested breeds and GDV/bloat risk (Great Dane, Weimaraner, Standard Poodle, German Shepherd)
- Brachycephalic breed respiratory emergencies (Bulldog, Pug, French Bulldog)
- German Shepherd degenerative myelopathy
- Cavalier King Charles Spaniel heart disease (MVD)
- Doberman dilated cardiomyopathy
- Golden Retriever cancer predisposition
- Labrador Retriever exercise-induced collapse
- Dachshund IVDD (intervertebral disc disease)
- Small breed hypoglycemia (Chihuahua, Yorkshire Terrier)
- Dalmatian urinary stones
- Cocker Spaniel ear infections
- Breed-specific anesthesia risks

**Source targets:** AKC Canine Health Foundation, OFA, breed-specific veterinary literature, Merck Vet Manual

## Priority 2: Quality Gaps (~50 new chunks)

### 2a. Respiratory Content (target: +10 chunks)
- Kennel cough / infectious tracheobronchitis
- Pneumonia signs
- Collapsing trachea
- Reverse sneezing vs respiratory distress
- Brachycephalic obstructive airway syndrome (BOAS)

### 2b. Neurology Content (target: +10 chunks)
- Seizure types and causes
- Vestibular disease (old dog syndrome)
- Intervertebral disc disease (IVDD)
- Head tilt differential diagnosis
- Tremors vs seizures

### 2c. Disease Content (target: +15 chunks)
- Pancreatitis (acute vs chronic)
- Cushing's disease
- Addison's disease
- Diabetes mellitus
- Kidney disease (acute vs chronic)
- Liver disease signs
- Leptospirosis
- Tick-borne diseases (Lyme, Ehrlichia, Anaplasmosis)

### 2d. Dermatology Content (target: +10 chunks)
- Hot spots
- Allergic dermatitis (food vs environmental)
- Ear infections (otitis externa)
- Mange (demodectic vs sarcoptic)
- Lumps and bumps — when to worry

### 2e. Urinary Content (target: +5 chunks)
- Urinary tract infections
- Bladder stones
- Urinary obstruction (emergency)
- Incontinence
- Blood in urine

## Priority 3: Nice-to-Have (~50 chunks, post-launch)

- Dental health and periodontal disease
- Puppy-specific health concerns
- Senior dog health monitoring
- Post-surgical care
- Vaccination schedules and reactions
- Parasite prevention
- Behavioral emergencies (severe anxiety, aggression changes)
- Reproductive emergencies (dystocia, pyometra)

## Content Standards

Each chunk must include:
- **Source URL**: Direct link to the source material
- **Source name**: Organization or publication name
- **Source tier**: 1 (veterinary institution/textbook), 2 (reputable vet website), 3 (general pet health)
- **Category**: Matching the categories above
- **Section title**: Descriptive heading for the chunk
- **Word count**: Target 150-400 words per chunk (optimal for RAG retrieval)

### Tier 1 Sources (preferred)
- Merck Veterinary Manual (merckvetmanual.com)
- AVMA (avma.org)
- ACVS (acvs.org)
- ACVIM (acvim.org)
- AKC Canine Health Foundation (akcchf.org)
- Cornell University College of Veterinary Medicine
- UC Davis Veterinary Medicine

### Tier 2 Sources (acceptable)
- VCA Animal Hospitals (vcahospitals.com)
- PetMD (petmd.com)
- ASPCA (aspca.org)
- Pet Poison Helpline (petpoisonhelpline.com)

### Tier 3 Sources (use sparingly)
- AKC (akc.org) — for breed info only
- Reputable breed club health resources

## Implementation Steps

1. **Scrape and chunk content** from Tier 1 sources first
2. **Generate embeddings** using the same model as existing chunks (check `dog_health_content` embedding dimensions)
3. **Insert into `dog_health_content`** table with proper metadata
4. **Validate** by running hybrid search queries for previously-failing prompts
5. **Re-run stress test** Categories 9 and 12 to measure improvement
6. **Iterate** — add more content if gaps remain

## Success Criteria

- `dog_health_content` reaches 500+ chunks
- Cat 9 (Breed Context) improves from 80% to 90%+
- Cat 12 (Source Attribution) improves from 80% to 90%+
- No Tier 1 regressions
- All new content has proper source attribution (tier 1 or 2)

## Estimated Effort

| Priority | New Chunks | Estimated Time |
|----------|-----------|----------------|
| P1: Safety-Critical | ~100 | 2-3 days |
| P2: Quality | ~50 | 1-2 days |
| P3: Nice-to-Have | ~50 | 1-2 days |
| **Total** | **~200** | **4-7 days** |
