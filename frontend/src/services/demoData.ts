import { LegalDocument, ResearchAnswerResult } from '../types/legal';

/**
 * Curated, internally consistent legal corpus for LexSphere Demo Mode.
 * Covers Indian Contract Law, Landmark Constitutional Rulings, and Data Protection.
 */
export const DEMO_DOCUMENTS: LegalDocument[] = [
  {
    id: 'doc-kailash-nath-2015',
    title: 'Kailash Nath Associates v. Delhi Development Authority',
    citation: '(2015) 4 SCC 136',
    court: 'Supreme Court of India',
    jurisdiction: 'India (Federal)',
    date: '2015-01-09',
    category: 'Commercial & Contract Law',
    fileName: 'Kailash_Nath_Associates_v_DDA_2015.pdf',
    fileSizeBytes: 2451200,
    pagesCount: 28,
    chunksCount: 84,
    status: 'ready',
    processingProgress: 100,
    summary: 'Landmark Supreme Court decision on Section 74 of the Indian Contract Act, holding that liquidated damages and forfeiture of earnest money require proof of actual loss unless impossible to ascertain.',
    createdAt: '2026-09-26T08:30:00Z'
  },
  {
    id: 'doc-contract-act-1872',
    title: 'The Indian Contract Act, 1872 (Sections 73 & 74)',
    citation: 'Act IX of 1872',
    court: 'Statutory Code / Parliament',
    jurisdiction: 'India (Federal)',
    date: '1872-04-25',
    category: 'Statute / Commercial Law',
    fileName: 'Indian_Contract_Act_1872_Extract.pdf',
    fileSizeBytes: 1280400,
    pagesCount: 42,
    chunksCount: 126,
    status: 'ready',
    processingProgress: 100,
    summary: 'Foundational statute governing breach of contracts, compensation for breach (s. 73), and liquidated damages vs contractual penalties (s. 74).',
    createdAt: '2026-09-26T08:45:00Z'
  },
  {
    id: 'doc-dpdp-act-2023',
    title: 'Digital Personal Data Protection Act, 2023',
    citation: 'Act No. 22 of 2023',
    court: 'Parliament of India',
    jurisdiction: 'India (Federal)',
    date: '2023-08-11',
    category: 'Statute / Privacy & Technology',
    fileName: 'DPDP_Act_2023_Official_Gazette.pdf',
    fileSizeBytes: 1845600,
    pagesCount: 24,
    chunksCount: 72,
    status: 'ready',
    processingProgress: 100,
    summary: 'Comprehensive data privacy statute regulating collection, storage, processing, legitimate uses, consent architectures, and cross-border transfers.',
    createdAt: '2026-09-26T09:15:00Z'
  },
  {
    id: 'doc-puttaswamy-2017',
    title: 'Justice K.S. Puttaswamy (Retd.) v. Union of India',
    citation: '(2017) 10 SCC 1',
    court: 'Supreme Court of India (9-Judge Bench)',
    jurisdiction: 'India (Constitutional)',
    date: '2017-08-24',
    category: 'Constitutional Law / Fundamental Rights',
    fileName: 'Justice_KS_Puttaswamy_v_UOI_2017.pdf',
    fileSizeBytes: 6840000,
    pagesCount: 547,
    chunksCount: 1640,
    status: 'ready',
    processingProgress: 100,
    summary: 'Unanimous 9-judge bench ruling declaring privacy a fundamental right under Article 21, establishing the four-fold proportionality test for state interference.',
    createdAt: '2026-09-26T09:30:00Z'
  },
  {
    id: 'doc-kesavananda-1973',
    title: 'Kesavananda Bharati v. State of Kerala',
    citation: '(1973) 4 SCC 225',
    court: 'Supreme Court of India (13-Judge Bench)',
    jurisdiction: 'India (Constitutional)',
    date: '1973-04-24',
    category: 'Constitutional Law',
    fileName: 'Kesavananda_Bharati_1973_Ratio.pdf',
    fileSizeBytes: 5120300,
    pagesCount: 135,
    chunksCount: 412,
    status: 'ready',
    processingProgress: 100,
    summary: 'Historical constitutional ruling enunciating the Basic Structure Doctrine restricting parliamentary amending power under Article 368.',
    createdAt: '2026-09-26T09:50:00Z'
  }
];

export interface SampleLegalQuestion {
  id: string;
  category: string;
  title: string;
  query: string;
  relatedDocIds: string[];
}

export const SAMPLE_RESEARCH_QUESTIONS: SampleLegalQuestion[] = [
  {
    id: 'q1',
    category: 'Contract Law / Damages',
    title: 'Liquidated Damages & Proof of Loss (Sec 74)',
    query: 'What are the essential legal requirements to enforce a liquidated damages clause under Section 74 of the Indian Contract Act, and can earnest money be forfeited without proving actual loss?',
    relatedDocIds: ['doc-kailash-nath-2015', 'doc-contract-act-1872']
  },
  {
    id: 'q2',
    category: 'Data Privacy / Compliance',
    title: 'Legitimate Uses & Consent Exceptions in DPDP 2023',
    query: 'What are the permissible grounds for processing personal data without explicit consent under legitimate uses in the DPDP Act 2023, specifically regarding employment and state subsidies?',
    relatedDocIds: ['doc-dpdp-act-2023']
  },
  {
    id: 'q3',
    category: 'Constitutional / Fundamental Rights',
    title: 'Proportionality Standard for Right to Privacy',
    query: 'What standard of scrutiny and proportionality test must state action satisfy when infringing the fundamental right to privacy under Justice K.S. Puttaswamy (2017)?',
    relatedDocIds: ['doc-puttaswamy-2017']
  },
  {
    id: 'q4',
    category: 'Constitutional / Basic Structure',
    title: 'Limits on Article 368 Amending Power',
    query: 'Can Parliament amend fundamental rights or abrogate judicial review under Article 368 of the Constitution pursuant to Kesavananda Bharati?',
    relatedDocIds: ['doc-kesavananda-1973']
  }
];

export const DEMO_RESEARCH_RESPONSES: Record<string, ResearchAnswerResult> = {
  // Key for Contract Law / Section 74 Query
  'q1': {
    queryId: 'qry-contract-sec74-kailash-nath',
    query: 'What are the essential legal requirements to enforce a liquidated damages clause under Section 74 of the Indian Contract Act, and can earnest money be forfeited without proving actual loss?',
    groundedAnswer: `Under Indian contract jurisprudence governed by Section 74 of the Indian Contract Act, 1872, the stipulation of a liquidated damages clause does not grant an automatic entitlement to recover the named sum upon a mere breach [1]. Following the authoritative restatement of law by the Supreme Court in *Kailash Nath Associates v. Delhi Development Authority (2015)*, damages can only be awarded if the claimant has suffered actual damage or loss resulting from the breach [2]. 

The court reiterated that where it is possible to prove actual damage or loss, such proof is mandatory and not dispensed with [2]. Liquidated damages represent only an upper ceiling, and the court is bound to award only 'reasonable compensation' [3].

Regarding forfeiture of earnest money or security deposits, the Supreme Court held that forfeiture is governed by the same principles of Section 74: where the promisee suffers no loss whatsoever (such as where a re-auction generates a higher surplus), forfeiture of the entire deposit is treated as an unenforceable penalty [4]. However, reasonable earnest money intended strictly as a guarantee of contract performance may still be forfeited if bona fide administrative expenses or disruption occurred [5].`,
    supportingPassages: [
      {
        id: 'pass-kn-para43',
        documentId: 'doc-kailash-nath-2015',
        documentTitle: 'Kailash Nath Associates v. Delhi Development Authority',
        citation: '(2015) 4 SCC 136',
        court: 'Supreme Court of India',
        date: '2015-01-09',
        pageNumber: 14,
        paragraphNumber: 'Paragraph 43.1 - 43.4',
        excerpt: 'Section 74 applies where damage or loss is caused by breach of contract. Where it is possible to prove actual damage or loss, such proof is not dispensed with. It is only in cases where damage or loss is impossible or difficult to prove that the liquidated amount, if it is a genuine pre-estimate, can be awarded. Compensation awarded under Section 74 must be reasonable, not exceeding the amount named or the penalty stipulated.',
        retrievalMethod: 'hybrid_reranked',
        bm25Score: 24.8,
        denseScore: 0.912,
        combinedScore: 0.965,
        matchedKeywords: ['Section 74', 'damage or loss', 'liquidated amount', 'reasonable compensation', 'penalty stipulated']
      },
      {
        id: 'pass-ica-s74',
        documentId: 'doc-contract-act-1872',
        documentTitle: 'The Indian Contract Act, 1872',
        citation: 'Act IX of 1872',
        court: 'Statutory Code',
        date: '1872-04-25',
        pageNumber: 31,
        paragraphNumber: 'Section 74',
        excerpt: '74. Compensation for breach of contract where penalty stipulated for.—When a contract has been broken, if a sum is named in the contract as the amount to be paid in case of such breach, or if the contract contains any other stipulation by way of penalty, the party complaining of the breach is entitled, whether or not actual damage or loss is proved to have been caused thereby, to receive from the party who has broken the contract reasonable compensation not exceeding the amount so named or, as the case may be, the penalty stipulated for.',
        retrievalMethod: 'bm25',
        bm25Score: 28.3,
        denseScore: 0.835,
        combinedScore: 0.921,
        matchedKeywords: ['Compensation for breach', 'penalty', 'reasonable compensation', 'sum is named']
      },
      {
        id: 'pass-kn-forfeiture',
        documentId: 'doc-kailash-nath-2015',
        documentTitle: 'Kailash Nath Associates v. Delhi Development Authority',
        citation: '(2015) 4 SCC 136',
        court: 'Supreme Court of India',
        date: '2015-01-09',
        pageNumber: 18,
        paragraphNumber: 'Paragraph 44',
        excerpt: 'Since DDA did not suffer any loss when the subsequent auction of the plot fetched Rs. 11.75 crores against the earlier bid of Rs. 3.12 crores, forfeiture of the earnest money of Rs. 78,00,000/- was held to be illegal and contrary to Section 74, as no loss was suffered by the Authority.',
        retrievalMethod: 'hybrid_reranked',
        bm25Score: 19.4,
        denseScore: 0.884,
        combinedScore: 0.898,
        matchedKeywords: ['DDA', 'forfeiture of earnest money', 'no loss was suffered', 'illegal']
      },
      {
        id: 'pass-ica-s73',
        documentId: 'doc-contract-act-1872',
        documentTitle: 'The Indian Contract Act, 1872',
        citation: 'Act IX of 1872',
        court: 'Statutory Code',
        date: '1872-04-25',
        pageNumber: 30,
        paragraphNumber: 'Section 73',
        excerpt: '73. Compensation for loss or damage caused by breach of contract.—When a contract has been broken, the party who suffers by such breach is entitled to receive from the party who has broken the contract, compensation for any loss or damage caused to him thereby, which naturally arose in the usual course of things.',
        retrievalMethod: 'dense',
        bm25Score: 14.1,
        denseScore: 0.794,
        combinedScore: 0.815,
        matchedKeywords: ['Compensation for loss', 'naturally arose', 'usual course']
      }
    ],
    citations: [
      {
        id: 'cit-1',
        marker: '[1]',
        claimText: 'Liquidated damages clause does not grant an automatic entitlement to recover the named sum upon a mere breach.',
        sourceDocumentId: 'doc-contract-act-1872',
        sourceDocumentTitle: 'The Indian Contract Act, 1872 (Section 74)',
        sourcePage: 31,
        sourceParagraph: 'Section 74',
        sourceExcerpt: 'entitled, whether or not actual damage or loss is proved to have been caused thereby, to receive from the party who has broken the contract reasonable compensation not exceeding the amount so named.',
        verificationStatus: 'verified',
        confidenceScore: 0.97,
        verificationRationale: 'Direct entailment. Judicial interpretation of Section 74 consistently limits recovery to proven reasonable compensation rather than automatic statutory windfall.',
        entailmentType: 'direct_entailment'
      },
      {
        id: 'cit-2',
        marker: '[2]',
        claimText: 'Damages can only be awarded if actual loss occurred, and where possible to prove, such proof is mandatory and not dispensed with.',
        sourceDocumentId: 'doc-kailash-nath-2015',
        sourceDocumentTitle: 'Kailash Nath Associates v. DDA, (2015) 4 SCC 136',
        sourcePage: 14,
        sourceParagraph: 'Para 43.1',
        sourceExcerpt: 'Where it is possible to prove actual damage or loss, such proof is not dispensed with. It is only in cases where damage or loss is impossible or difficult to prove that the liquidated amount... can be awarded.',
        verificationStatus: 'verified',
        confidenceScore: 0.99,
        verificationRationale: 'Exact ratio entailment matching the verbatim holding of Justice R.F. Nariman in Paragraph 43.1.',
        entailmentType: 'direct_entailment'
      },
      {
        id: 'cit-3',
        marker: '[3]',
        claimText: 'Liquidated damages represent only an upper ceiling, and the court is bound to award only reasonable compensation.',
        sourceDocumentId: 'doc-contract-act-1872',
        sourceDocumentTitle: 'The Indian Contract Act, 1872 (Section 74)',
        sourcePage: 31,
        sourceParagraph: 'Section 74',
        sourceExcerpt: 'reasonable compensation not exceeding the amount so named or, as the case may be, the penalty stipulated for.',
        verificationStatus: 'verified',
        confidenceScore: 0.96,
        verificationRationale: 'Directly supported by statutory words "not exceeding the amount so named".',
        entailmentType: 'direct_entailment'
      },
      {
        id: 'cit-4',
        marker: '[4]',
        claimText: 'Where the promisee suffers no loss whatsoever (e.g. re-auction generates a higher surplus), forfeiture of the entire deposit is treated as an unenforceable penalty.',
        sourceDocumentId: 'doc-kailash-nath-2015',
        sourceDocumentTitle: 'Kailash Nath Associates v. DDA, (2015) 4 SCC 136',
        sourcePage: 18,
        sourceParagraph: 'Para 44',
        sourceExcerpt: 'Since DDA did not suffer any loss when the subsequent auction of the plot fetched Rs. 11.75 crores against the earlier bid of Rs. 3.12 crores, forfeiture of the earnest money... was held to be illegal.',
        verificationStatus: 'verified',
        confidenceScore: 0.98,
        verificationRationale: 'Entailed by factual holding and application of Section 74 to unproven forfeiture claims.',
        entailmentType: 'direct_entailment'
      },
      {
        id: 'cit-5',
        marker: '[5]',
        claimText: 'Reasonable earnest money intended strictly as a guarantee of performance may still be forfeited if bona fide administrative expenses occurred.',
        sourceDocumentId: 'doc-kailash-nath-2015',
        sourceDocumentTitle: 'Kailash Nath Associates v. DDA, (2015) 4 SCC 136',
        sourcePage: 22,
        sourceParagraph: 'Para 40',
        sourceExcerpt: 'Earnest money is given when the contract is concluded as a pledge for due performance. But if forfeiture exceeds genuine damage or earnest character, s. 74 applies.',
        verificationStatus: 'partially_verified',
        confidenceScore: 0.76,
        verificationRationale: 'Partially verified: The court recognizes nominal earnest money forfeiture concepts from Maula Bux, but explicitly subjects all forfeiture to Section 74 reasonableness scrutiny.',
        entailmentType: 'partial_support'
      }
    ],
    pipelineMetadata: {
      preprocessingTimeMs: 28,
      retrievalStrategy: 'Hybrid (BM25 Keyword + 768-dim Dense Vector Index)',
      bm25CandidatesCount: 32,
      semanticCandidatesCount: 26,
      rerankedPassagesCount: 4,
      ollamaModel: 'llama3:8b (Local Ollama via FastAPI backend)',
      generationTimeMs: 1340,
      verificationTimeMs: 410,
      totalLatencyMs: 1806,
      fusionMethod: 'Reciprocal Rank Fusion (RRF k=60) + Cross-Encoder Reranker'
    },
    timestamp: '2026-09-26T12:00:00Z'
  },

  // Key for DPDP Act 2023 Query
  'q2': {
    queryId: 'qry-dpdp-legitimate-uses-2023',
    query: 'What are the permissible grounds for processing personal data without explicit consent under legitimate uses in the DPDP Act 2023, specifically regarding employment and state subsidies?',
    groundedAnswer: `Under Section 7 of the Digital Personal Data Protection Act, 2023 (DPDP Act), a Data Fiduciary may process personal data for specific 'certain legitimate uses' without obtaining explicit consent from the Data Principal [1]. 

The primary statutory grounds include:
1. **Voluntary Provision:** Where the Data Principal has voluntarily provided personal data for a specified purpose without indicating objection [2].
2. **State Subsidies, Benefits & Certificates:** For the provision of any subsidy, benefit, service, certificate, licence, or permit issued by the Central or State Government [3].
3. **Employment Purposes:** For employment purposes, including prevention of corporate espionage, maintenance of confidentiality, or verification of attendance [4].
4. **Legal Compliance & Medical Emergencies:** Compliance with judicial orders, medical response during life-threatening epidemics, and disaster management [1].

Importantly, while consent is bypassed under Section 7, the Data Fiduciary remains subject to reasonable security safeguards under Section 8(5) and breach notification mandates [5].`,
    supportingPassages: [
      {
        id: 'pass-dpdp-s7',
        documentId: 'doc-dpdp-act-2023',
        documentTitle: 'Digital Personal Data Protection Act, 2023',
        citation: 'Act No. 22 of 2023',
        court: 'Parliament of India',
        date: '2023-08-11',
        pageNumber: 6,
        paragraphNumber: 'Section 7(a)-(i)',
        excerpt: '7. Certain legitimate uses.—A Data Fiduciary may process personal data of a Data Principal for any of the following uses, namely:— (a) for specified purpose for which the Data Principal has voluntarily provided data... (b) for the State and any of its instrumentalities to provide or issue subsidy, benefit, certificate... (i) for the purposes of employment or those related to safeguarding the employer from loss.',
        retrievalMethod: 'hybrid_reranked',
        bm25Score: 31.2,
        denseScore: 0.941,
        combinedScore: 0.982,
        matchedKeywords: ['Certain legitimate uses', 'Data Fiduciary', 'subsidy, benefit', 'purposes of employment']
      },
      {
        id: 'pass-dpdp-s8',
        documentId: 'doc-dpdp-act-2023',
        documentTitle: 'Digital Personal Data Protection Act, 2023',
        citation: 'Act No. 22 of 2023',
        court: 'Parliament of India',
        date: '2023-08-11',
        pageNumber: 8,
        paragraphNumber: 'Section 8(5)',
        excerpt: '8(5). A Data Fiduciary shall protect personal data in its possession or under its control, including in respect of any processing undertaken by it or on its behalf by a Data Processor, by taking reasonable security safeguards to prevent personal data breach.',
        retrievalMethod: 'bm25',
        bm25Score: 22.1,
        denseScore: 0.812,
        combinedScore: 0.874,
        matchedKeywords: ['reasonable security safeguards', 'personal data breach', 'Data Processor']
      }
    ],
    citations: [
      {
        id: 'cit-dpdp-1',
        marker: '[1]',
        claimText: 'Data Fiduciary may process personal data for specific legitimate uses without obtaining explicit consent.',
        sourceDocumentId: 'doc-dpdp-act-2023',
        sourceDocumentTitle: 'Digital Personal Data Protection Act, 2023 (Section 7)',
        sourcePage: 6,
        sourceParagraph: 'Section 7 opening words',
        sourceExcerpt: 'A Data Fiduciary may process personal data of a Data Principal for any of the following uses...',
        verificationStatus: 'verified',
        confidenceScore: 0.98,
        verificationRationale: 'Direct statutory entailment from the opening text of Section 7 of DPDP Act 2023.',
        entailmentType: 'direct_entailment'
      },
      {
        id: 'cit-dpdp-2',
        marker: '[2]',
        claimText: 'Voluntary provision of data for a specified purpose without objection constitutes legitimate use.',
        sourceDocumentId: 'doc-dpdp-act-2023',
        sourceDocumentTitle: 'Digital Personal Data Protection Act, 2023 (Section 7(a))',
        sourcePage: 6,
        sourceParagraph: 'Section 7(a)',
        sourceExcerpt: 'for the specified purpose for which the Data Principal has voluntarily provided her personal data to the Data Fiduciary.',
        verificationStatus: 'verified',
        confidenceScore: 0.99,
        verificationRationale: 'Verbatim alignment with Section 7(a).',
        entailmentType: 'direct_entailment'
      },
      {
        id: 'cit-dpdp-3',
        marker: '[3]',
        claimText: 'Processing permissible for State subsidies, benefits, certificates, and licences.',
        sourceDocumentId: 'doc-dpdp-act-2023',
        sourceDocumentTitle: 'Digital Personal Data Protection Act, 2023 (Section 7(b))',
        sourcePage: 6,
        sourceParagraph: 'Section 7(b)',
        sourceExcerpt: 'for the State and any of its instrumentalities to provide or issue to the Data Principal such subsidy, benefit, service, certificate, licence or permit.',
        verificationStatus: 'verified',
        confidenceScore: 0.99,
        verificationRationale: 'Direct statutory corroboration from Section 7(b).',
        entailmentType: 'direct_entailment'
      },
      {
        id: 'cit-dpdp-4',
        marker: '[4]',
        claimText: 'Processing permissible for employment purposes and safeguarding employers from corporate espionage or loss.',
        sourceDocumentId: 'doc-dpdp-act-2023',
        sourceDocumentTitle: 'Digital Personal Data Protection Act, 2023 (Section 7(i))',
        sourcePage: 7,
        sourceParagraph: 'Section 7(i)',
        sourceExcerpt: 'for the purposes of employment or those related to safeguarding the employer from loss or liability, such as prevention of corporate espionage, maintenance of confidentiality of trade secrets.',
        verificationStatus: 'verified',
        confidenceScore: 0.98,
        verificationRationale: 'Exact match with Section 7(i) statutory language.',
        entailmentType: 'direct_entailment'
      },
      {
        id: 'cit-dpdp-5',
        marker: '[5]',
        claimText: 'Data Fiduciaries remain subject to security safeguards and breach notification mandates despite consent bypass.',
        sourceDocumentId: 'doc-dpdp-act-2023',
        sourceDocumentTitle: 'Digital Personal Data Protection Act, 2023 (Section 8(5))',
        sourcePage: 8,
        sourceParagraph: 'Section 8(5) & 8(6)',
        sourceExcerpt: 'A Data Fiduciary shall protect personal data in its possession... by taking reasonable security safeguards to prevent personal data breach.',
        verificationStatus: 'verified',
        confidenceScore: 0.94,
        verificationRationale: 'Entailed by general obligations of Data Fiduciaries under Section 8 which apply across all processing modes.',
        entailmentType: 'direct_entailment'
      }
    ],
    pipelineMetadata: {
      preprocessingTimeMs: 24,
      retrievalStrategy: 'Hybrid (BM25 Keyword + 768-dim Dense Vector Index)',
      bm25CandidatesCount: 22,
      semanticCandidatesCount: 19,
      rerankedPassagesCount: 2,
      ollamaModel: 'llama3:8b (Local Ollama via FastAPI backend)',
      generationTimeMs: 1180,
      verificationTimeMs: 340,
      totalLatencyMs: 1568,
      fusionMethod: 'Reciprocal Rank Fusion (RRF k=60) + Cross-Encoder Reranker'
    },
    timestamp: '2026-09-26T12:05:00Z'
  },

  // Key for Puttaswamy Right to Privacy Proportionality Query
  'q3': {
    queryId: 'qry-puttaswamy-privacy-proportionality',
    query: 'What standard of scrutiny and proportionality test must state action satisfy when infringing the fundamental right to privacy under Justice K.S. Puttaswamy (2017)?',
    groundedAnswer: `In *Justice K.S. Puttaswamy (Retd.) v. Union of India (2017)*, a 9-judge Constitution Bench held that privacy is an inalienable fundamental right emanating from Article 21 and Part III of the Constitution [1]. 

To survive constitutional review, any state encroachment upon privacy must satisfy a four-fold proportionality test [2]:
1. **Legality:** The action must be backed by an express, valid law enacted by a competent legislature [2].
2. **Legitimate State Aim:** The measure must pursue a legitimate state goal, such as national security or crime prevention [3].
3. **Suitability & Rational Connection:** There must be a rational nexus between the intrusive measure and the statutory objective [2].
4. **Necessity & Least Intrusive Means:** The state must adopt the least restrictive measure that achieves the objective without excessive overreach [4].
5. **Procedural Safeguards:** Independent oversight mechanisms must exist to prevent arbitrary executive abuse [5].`,
    supportingPassages: [
      {
        id: 'pass-putt-para310',
        documentId: 'doc-puttaswamy-2017',
        documentTitle: 'Justice K.S. Puttaswamy (Retd.) v. Union of India',
        citation: '(2017) 10 SCC 1',
        court: 'Supreme Court of India',
        date: '2017-08-24',
        pageNumber: 264,
        paragraphNumber: 'Paragraph 310 (Chandrachud J.)',
        excerpt: 'An invasion of life or personal liberty must meet the threefold requirement of (i) legality, which postulates the existence of law; (ii) need, defined in terms of a legitimate state aim; and (iii) proportionality which ensures a rational nexus between the objects and the means adopted to achieve them.',
        retrievalMethod: 'hybrid_reranked',
        bm25Score: 29.7,
        denseScore: 0.961,
        combinedScore: 0.985,
        matchedKeywords: ['invasion of life or personal liberty', 'legality', 'legitimate state aim', 'proportionality']
      },
      {
        id: 'pass-putt-kaul-para638',
        documentId: 'doc-puttaswamy-2017',
        documentTitle: 'Justice K.S. Puttaswamy (Retd.) v. Union of India',
        citation: '(2017) 10 SCC 1',
        court: 'Supreme Court of India',
        date: '2017-08-24',
        pageNumber: 489,
        paragraphNumber: 'Paragraph 638 (Kaul J.)',
        excerpt: 'The proportionality test requires that: (a) the action must be sanctioned by law; (b) the proposed action must be necessary in a democratic society for a legitimate aim; (c) the extent of such interference must be proportionate to the need; and (d) there must be procedural guarantees against abuse.',
        retrievalMethod: 'hybrid_reranked',
        bm25Score: 27.4,
        denseScore: 0.938,
        combinedScore: 0.962,
        matchedKeywords: ['proportionality test', 'sanctioned by law', 'procedural guarantees against abuse']
      }
    ],
    citations: [
      {
        id: 'cit-putt-1',
        marker: '[1]',
        claimText: 'Privacy is an inalienable fundamental right under Article 21 and Part III.',
        sourceDocumentId: 'doc-puttaswamy-2017',
        sourceDocumentTitle: 'Justice K.S. Puttaswamy v. UOI, (2017) 10 SCC 1',
        sourcePage: 264,
        sourceParagraph: 'Conclusion Para 310',
        sourceExcerpt: 'The right to privacy is protected as an intrinsic part of the right to life and personal liberty under Article 21.',
        verificationStatus: 'verified',
        confidenceScore: 0.99,
        verificationRationale: 'Direct unanimous ratio in Supreme Court ruling.',
        entailmentType: 'direct_entailment'
      },
      {
        id: 'cit-putt-2',
        marker: '[2]',
        claimText: 'State encroachment must satisfy legality and rational connection (suitability).',
        sourceDocumentId: 'doc-puttaswamy-2017',
        sourceDocumentTitle: 'Justice K.S. Puttaswamy v. UOI, (2017) 10 SCC 1',
        sourcePage: 264,
        sourceParagraph: 'Para 310',
        sourceExcerpt: 'legality, which postulates the existence of law; and proportionality which ensures a rational nexus.',
        verificationStatus: 'verified',
        confidenceScore: 0.98,
        verificationRationale: 'Direct textual entailment.',
        entailmentType: 'direct_entailment'
      },
      {
        id: 'cit-putt-3',
        marker: '[3]',
        claimText: 'The measure must pursue a legitimate state goal.',
        sourceDocumentId: 'doc-puttaswamy-2017',
        sourceDocumentTitle: 'Justice K.S. Puttaswamy v. UOI, (2017) 10 SCC 1',
        sourcePage: 264,
        sourceParagraph: 'Para 310',
        sourceExcerpt: 'need, defined in terms of a legitimate state aim.',
        verificationStatus: 'verified',
        confidenceScore: 0.99,
        verificationRationale: 'Directly supported by Chandrachud J. ratio.',
        entailmentType: 'direct_entailment'
      },
      {
        id: 'cit-putt-4',
        marker: '[4]',
        claimText: 'State must adopt the least restrictive measure that achieves the objective without overreach.',
        sourceDocumentId: 'doc-puttaswamy-2017',
        sourceDocumentTitle: 'Justice K.S. Puttaswamy v. UOI, (2017) 10 SCC 1',
        sourcePage: 489,
        sourceParagraph: 'Para 638',
        sourceExcerpt: 'the extent of such interference must be proportionate to the need for such interference.',
        verificationStatus: 'partially_verified',
        confidenceScore: 0.84,
        verificationRationale: 'Partially verified: European jurisprudence phrasing "least intrusive means" was discussed in Kaul J. & Nariman J. opinions, though phrasing in lead opinion focuses on proportionality and rational nexus.',
        entailmentType: 'partial_support'
      },
      {
        id: 'cit-putt-5',
        marker: '[5]',
        claimText: 'Independent procedural safeguards must exist against executive abuse.',
        sourceDocumentId: 'doc-puttaswamy-2017',
        sourceDocumentTitle: 'Justice K.S. Puttaswamy v. UOI, (2017) 10 SCC 1',
        sourcePage: 489,
        sourceParagraph: 'Para 638',
        sourceExcerpt: 'there must be procedural guarantees against such abuse of state power.',
        verificationStatus: 'verified',
        confidenceScore: 0.97,
        verificationRationale: 'Direct corroboration from Kaul J. concurrent opinion.',
        entailmentType: 'direct_entailment'
      }
    ],
    pipelineMetadata: {
      preprocessingTimeMs: 35,
      retrievalStrategy: 'Hybrid (BM25 Keyword + 768-dim Dense Vector Index)',
      bm25CandidatesCount: 45,
      semanticCandidatesCount: 38,
      rerankedPassagesCount: 2,
      ollamaModel: 'llama3:8b (Local Ollama via FastAPI backend)',
      generationTimeMs: 1490,
      verificationTimeMs: 420,
      totalLatencyMs: 1980,
      fusionMethod: 'Reciprocal Rank Fusion (RRF k=60) + Cross-Encoder Reranker'
    },
    timestamp: '2026-09-26T12:10:00Z'
  },

  // Key for Kesavananda Bharati Basic Structure Query
  'q4': {
    queryId: 'qry-kesavananda-basic-structure',
    query: 'Can Parliament amend fundamental rights or abrogate judicial review under Article 368 of the Constitution pursuant to Kesavananda Bharati?',
    groundedAnswer: `In the historic 13-judge decision in *Kesavananda Bharati v. State of Kerala (1973)*, the Supreme Court of India held by a 7:6 majority that while Parliament holds broad constituent power to amend any provision of the Constitution under Article 368, such power does not include the power to alter, destroy, or abrogate the 'Basic Structure' or essential framework of the Constitution [1].

Key constitutional holdings established in the ruling:
1. **Constituent Power vs Inherent Limitation:** Article 368 confers constituent power to amend, but the word 'amend' implies preservation of identity, not emasculation or total revision [2].
2. **Fundamental Rights & Part III:** Fundamental rights may be amended to achieve socio-economic justice, provided the core essential features (such as rule of law, equality, and dignity) remain intact [3].
3. **Judicial Review as Basic Structure:** The power of constitutional judicial review exercised by High Courts (Art. 226) and Supreme Court (Art. 32) is an inviolable basic structure feature that cannot be ousted by constitutional amendments [4].
4. **Overruling Golak Nath:** The previous doctrine in *Golak Nath (1967)* that completely insulated fundamental rights from any amendment was explicitly overruled [5].`,
    supportingPassages: [
      {
        id: 'pass-kes-ratio',
        documentId: 'doc-kesavananda-1973',
        documentTitle: 'Kesavananda Bharati v. State of Kerala',
        citation: '(1973) 4 SCC 225',
        court: 'Supreme Court of India (13-Judge Bench)',
        date: '1973-04-24',
        pageNumber: 1,
        paragraphNumber: 'Majority Summary (Sikri C.J., Hegde, Mukherjea, Shelat, Grover, Jaganmohan Reddy, Khanna JJ.)',
        excerpt: 'Article 368 does not enable Parliament to alter the basic structure or framework of the Constitution. The majority holding recognizes inherent limitations upon the amending power.',
        retrievalMethod: 'hybrid_reranked',
        bm25Score: 33.1,
        denseScore: 0.975,
        combinedScore: 0.991,
        matchedKeywords: ['basic structure or framework', 'Article 368', 'inherent limitations', 'amending power']
      },
      {
        id: 'pass-kes-khanna',
        documentId: 'doc-kesavananda-1973',
        documentTitle: 'Kesavananda Bharati v. State of Kerala',
        citation: '(1973) 4 SCC 225',
        court: 'Supreme Court of India (13-Judge Bench)',
        date: '1973-04-24',
        pageNumber: 82,
        paragraphNumber: 'Khanna J. Judgment',
        excerpt: 'The word "amendment" postulates that the old Constitution survives without loss of identity despite the change. The power under Article 368 cannot be used to revoke the Constitution and install a new constitutional order.',
        retrievalMethod: 'dense',
        bm25Score: 21.4,
        denseScore: 0.942,
        combinedScore: 0.932,
        matchedKeywords: ['amendment postulates', 'loss of identity', 'new constitutional order']
      }
    ],
    citations: [
      {
        id: 'cit-kes-1',
        marker: '[1]',
        claimText: 'Parliament cannot alter, destroy, or abrogate the Basic Structure or essential framework of the Constitution.',
        sourceDocumentId: 'doc-kesavananda-1973',
        sourceDocumentTitle: 'Kesavananda Bharati v. State of Kerala, (1973) 4 SCC 225',
        sourcePage: 1,
        sourceParagraph: 'Majority View',
        sourceExcerpt: 'Article 368 does not enable Parliament to alter the basic structure or framework of the Constitution.',
        verificationStatus: 'verified',
        confidenceScore: 1.0,
        verificationRationale: 'Direct core holding signed by 9 majority and concurring judges.',
        entailmentType: 'direct_entailment'
      },
      {
        id: 'cit-kes-2',
        marker: '[2]',
        claimText: 'The word "amend" implies preservation of constitutional identity rather than total destruction.',
        sourceDocumentId: 'doc-kesavananda-1973',
        sourceDocumentTitle: 'Kesavananda Bharati v. State of Kerala, (1973) 4 SCC 225',
        sourcePage: 82,
        sourceParagraph: 'Khanna J.',
        sourceExcerpt: 'The word "amendment" postulates that the old Constitution survives without loss of identity.',
        verificationStatus: 'verified',
        confidenceScore: 0.98,
        verificationRationale: 'Verbatim alignment with Justice H.R. Khanna opinion.',
        entailmentType: 'direct_entailment'
      },
      {
        id: 'cit-kes-3',
        marker: '[3]',
        claimText: 'Fundamental rights may be amended provided core features like equality and dignity remain intact.',
        sourceDocumentId: 'doc-kesavananda-1973',
        sourceDocumentTitle: 'Kesavananda Bharati v. State of Kerala, (1973) 4 SCC 225',
        sourcePage: 85,
        sourceParagraph: 'Khanna J.',
        sourceExcerpt: 'No part of the Constitution, including Part III, is completely exempt from amendment, subject to the basic structure test.',
        verificationStatus: 'verified',
        confidenceScore: 0.95,
        verificationRationale: 'Directly supported by majority resolution on Part III flexibility.',
        entailmentType: 'direct_entailment'
      },
      {
        id: 'cit-kes-4',
        marker: '[4]',
        claimText: 'Judicial review exercised by High Courts and Supreme Court is an inviolable basic structure feature.',
        sourceDocumentId: 'doc-kesavananda-1973',
        sourceDocumentTitle: 'Kesavananda Bharati v. State of Kerala, (1973) 4 SCC 225',
        sourcePage: 110,
        sourceParagraph: 'Shelat & Grover JJ.',
        sourceExcerpt: 'The power of judicial review of legislation and executive action is an essential feature of our constitutional scheme.',
        verificationStatus: 'verified',
        confidenceScore: 0.97,
        verificationRationale: 'Entailed by ratio on separation of powers and judicial supremacy on constitutional questions.',
        entailmentType: 'direct_entailment'
      },
      {
        id: 'cit-kes-5',
        marker: '[5]',
        claimText: 'Golak Nath (1967) total bar on amending fundamental rights was explicitly overruled.',
        sourceDocumentId: 'doc-kesavananda-1973',
        sourceDocumentTitle: 'Kesavananda Bharati v. State of Kerala, (1973) 4 SCC 225',
        sourcePage: 1,
        sourceParagraph: 'Majority Order',
        sourceExcerpt: 'Golak Nath v. State of Punjab is overruled.',
        verificationStatus: 'verified',
        confidenceScore: 1.0,
        verificationRationale: 'Expressly recorded in the official signed summary of the Court.',
        entailmentType: 'direct_entailment'
      }
    ],
    pipelineMetadata: {
      preprocessingTimeMs: 30,
      retrievalStrategy: 'Hybrid (BM25 Keyword + 768-dim Dense Vector Index)',
      bm25CandidatesCount: 40,
      semanticCandidatesCount: 35,
      rerankedPassagesCount: 2,
      ollamaModel: 'llama3:8b (Local Ollama via FastAPI backend)',
      generationTimeMs: 1390,
      verificationTimeMs: 390,
      totalLatencyMs: 1845,
      fusionMethod: 'Reciprocal Rank Fusion (RRF k=60) + Cross-Encoder Reranker'
    },
    timestamp: '2026-09-26T12:15:00Z'
  }
};

/**
 * Dynamic fallback generator for any custom typed user query in Demo Mode
 * Synthesizes internally consistent answer, retrieved passages, and verified/unverified citations.
 */
export function generateDynamicDemoAnswer(
  customQuery: string, 
  availableDocs: LegalDocument[] = DEMO_DOCUMENTS
): ResearchAnswerResult {
  const queryLower = customQuery.toLowerCase();
  
  // Find matching pre-computed response if keywords align
  if (queryLower.includes('liquidat') || queryLower.includes('section 74') || queryLower.includes('contract') || queryLower.includes('earnest money') || queryLower.includes('kailash')) {
    return { ...DEMO_RESEARCH_RESPONSES['q1'], query: customQuery };
  }
  if (queryLower.includes('dpdp') || queryLower.includes('data protection') || queryLower.includes('legitimate use') || queryLower.includes('consent') || queryLower.includes('privacy act')) {
    return { ...DEMO_RESEARCH_RESPONSES['q2'], query: customQuery };
  }
  if (queryLower.includes('puttaswamy') || queryLower.includes('proportionality') || queryLower.includes('fundamental right to privacy') || queryLower.includes('article 21')) {
    return { ...DEMO_RESEARCH_RESPONSES['q3'], query: customQuery };
  }
  if (queryLower.includes('kesavananda') || queryLower.includes('basic structure') || queryLower.includes('article 368') || queryLower.includes('amending power')) {
    return { ...DEMO_RESEARCH_RESPONSES['q4'], query: customQuery };
  }

  // Synthesize a realistic structured answer matching the active indexed legal corpus
  const primaryDoc = availableDocs[0] || DEMO_DOCUMENTS[0];
  const secondaryDoc = availableDocs[1] || DEMO_DOCUMENTS[1];

  return {
    queryId: `qry-dyn-${Date.now()}`,
    query: customQuery,
    groundedAnswer: `Based on the retrieved statutory authorities and precedent in the indexed repository regarding "${customQuery}":

1. **Statutory Baseline & Binding Ratio:** In evaluating legal obligations under the applicable framework (${primaryDoc.title}), the law establishes that general claims require strict adherence to statutory conditions precedent [1]. The judicial consensus dictates that mere assertions without foundational documentation cannot sustain legal relief [2].

2. **Evidentiary Threshold & Standards:** Under precedent established in *${secondaryDoc.title}*, evidence must establish direct legal causation rather than speculative inference [3]. Where statutory terms designate explicit procedures, alternative unapproved mechanisms remain legally ineffective [4].

3. **Judicial Review & Enforcement:** Courts examine both substantive merit and procedural propriety before granting equitable or compensatory remedies [1].`,
    supportingPassages: [
      {
        id: `pass-dyn-1`,
        documentId: primaryDoc.id,
        documentTitle: primaryDoc.title,
        citation: primaryDoc.citation,
        court: primaryDoc.court,
        date: primaryDoc.date,
        pageNumber: 12,
        paragraphNumber: 'Section / Clause 14',
        excerpt: `The statutory mandate requires strict verification of conditions precedent. Where legal duties are prescribed by statute, non-compliance renders subsequent executive actions ultra vires and invalid in the eyes of law.`,
        retrievalMethod: 'hybrid_reranked',
        bm25Score: 21.5,
        denseScore: 0.884,
        combinedScore: 0.912,
        matchedKeywords: customQuery.split(' ').filter(w => w.length > 3).slice(0, 4)
      },
      {
        id: `pass-dyn-2`,
        documentId: secondaryDoc.id,
        documentTitle: secondaryDoc.title,
        citation: secondaryDoc.citation,
        court: secondaryDoc.court,
        date: secondaryDoc.date,
        pageNumber: 24,
        paragraphNumber: 'Paragraph 32',
        excerpt: `Judicial discretion in granting relief is circumscribed by the four corners of the governing enactment. Precedent requires clear evidence of direct causation before compensatory damages or injunctive relief can be granted.`,
        retrievalMethod: 'bm25',
        bm25Score: 18.2,
        denseScore: 0.812,
        combinedScore: 0.854,
        matchedKeywords: ['precedent', 'statute', 'relief', 'evidence']
      }
    ],
    citations: [
      {
        id: 'cit-dyn-1',
        marker: '[1]',
        claimText: 'Claims require strict adherence to statutory conditions precedent and examination of procedural propriety.',
        sourceDocumentId: primaryDoc.id,
        sourceDocumentTitle: primaryDoc.title,
        sourcePage: 12,
        sourceExcerpt: 'The statutory mandate requires strict verification of conditions precedent.',
        verificationStatus: 'verified',
        confidenceScore: 0.95,
        verificationRationale: 'Direct semantic entailment between stated claim and Section 14 passage.',
        entailmentType: 'direct_entailment'
      },
      {
        id: 'cit-dyn-2',
        marker: '[2]',
        claimText: 'Mere assertions without foundational documentation cannot sustain legal relief.',
        sourceDocumentId: primaryDoc.id,
        sourceDocumentTitle: primaryDoc.title,
        sourcePage: 12,
        sourceExcerpt: 'non-compliance renders subsequent executive actions ultra vires and invalid in the eyes of law.',
        verificationStatus: 'partially_verified',
        confidenceScore: 0.81,
        verificationRationale: 'Partially verified: Source text emphasizes ultra vires principle; propositional claim applies principle to general evidentiary assertions.',
        entailmentType: 'partial_support'
      },
      {
        id: 'cit-dyn-3',
        marker: '[3]',
        claimText: 'Evidence must establish direct legal causation rather than speculative inference.',
        sourceDocumentId: secondaryDoc.id,
        sourceDocumentTitle: secondaryDoc.title,
        sourcePage: 24,
        sourceExcerpt: 'Precedent requires clear evidence of direct causation before compensatory damages or injunctive relief can be granted.',
        verificationStatus: 'verified',
        confidenceScore: 0.98,
        verificationRationale: 'High confidence verbatim ratio match with Paragraph 32 holding.',
        entailmentType: 'direct_entailment'
      },
      {
        id: 'cit-dyn-4',
        marker: '[4]',
        claimText: 'Where statutory terms designate explicit procedures, alternative unapproved mechanisms remain legally ineffective.',
        sourceDocumentId: secondaryDoc.id,
        sourceDocumentTitle: secondaryDoc.title,
        sourcePage: 24,
        sourceExcerpt: 'Judicial discretion in granting relief is circumscribed by the four corners of the governing enactment.',
        verificationStatus: 'verified',
        confidenceScore: 0.91,
        verificationRationale: 'Entailed by governing enactment limitation doctrine.',
        entailmentType: 'direct_entailment'
      }
    ],
    pipelineMetadata: {
      preprocessingTimeMs: 29,
      retrievalStrategy: 'Hybrid (BM25 Keyword + 768-dim Dense Vector Index)',
      bm25CandidatesCount: 24,
      semanticCandidatesCount: 22,
      rerankedPassagesCount: 2,
      ollamaModel: 'llama3:8b (Local Ollama via FastAPI backend)',
      generationTimeMs: 1250,
      verificationTimeMs: 360,
      totalLatencyMs: 1669,
      fusionMethod: 'Reciprocal Rank Fusion (RRF k=60) + Cross-Encoder Reranker'
    },
    timestamp: new Date().toISOString()
  };
}
