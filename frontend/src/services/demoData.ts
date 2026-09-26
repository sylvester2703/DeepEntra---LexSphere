import { LegalDocument, ResearchAnswerResult } from '../types/legal';

/**
 * Curated, verified legal corpus for LexSphere.
 * Exactly 5 authoritative legal documents verified for legal research.
 */
export const DEMO_DOCUMENTS: LegalDocument[] = [
  {
    id: 'doc-kailash-nath-2015',
    title: 'Kailash Nath Associates v. Delhi Development Authority',
    citation: '(2015) 4 SCC 136',
    court: 'Supreme Court of India',
    jurisdiction: 'India',
    date: '2015',
    category: 'Contract Law',
    fileName: 'Kailash_Nath_Associates_v_DDA_2015.pdf',
    fileSizeBytes: 2451200,
    pagesCount: 28,
    chunksCount: 84,
    status: 'ready',
    processingProgress: 100,
    summary: 'Landmark Supreme Court decision on Section 74 of the Indian Contract Act, establishing that liquidated damages and forfeiture of earnest money require proof of actual loss unless impossible to ascertain.',
    createdAt: '2026-09-26T08:30:00Z'
  },
  {
    id: 'doc-contract-act-1872',
    title: 'The Indian Contract Act, 1872',
    citation: 'Act IX of 1872',
    court: 'Statute',
    jurisdiction: 'India',
    date: '1872',
    category: 'Contract Law',
    fileName: 'Indian_Contract_Act_1872.pdf',
    fileSizeBytes: 1280400,
    pagesCount: 42,
    chunksCount: 126,
    status: 'ready',
    processingProgress: 100,
    summary: 'Foundational statute governing contract formation, performance, compensation for breach (Section 73), and liquidated damages vs penalty stipulations (Section 74).',
    createdAt: '2026-09-26T08:45:00Z'
  },
  {
    id: 'doc-dpdp-act-2023',
    title: 'Digital Personal Data Protection Act, 2023',
    citation: 'Act No. 22 of 2023',
    court: 'Statute / Parliament of India',
    jurisdiction: 'India',
    date: '2023',
    category: 'Privacy Law',
    fileName: 'DPDP_Act_2023.pdf',
    fileSizeBytes: 1845600,
    pagesCount: 24,
    chunksCount: 72,
    status: 'ready',
    processingProgress: 100,
    summary: 'Comprehensive statutory framework governing digital personal data processing, legitimate uses without explicit consent, data principal rights, and cross-border obligations.',
    createdAt: '2026-09-26T09:15:00Z'
  },
  {
    id: 'doc-puttaswamy-2017',
    title: 'Justice K.S. Puttaswamy (Retd.) v. Union of India',
    citation: '(2017) 10 SCC 1',
    court: 'Supreme Court of India',
    jurisdiction: 'India',
    date: '2017',
    category: 'Constitutional Law',
    fileName: 'Justice_KS_Puttaswamy_v_UOI_2017.pdf',
    fileSizeBytes: 6840000,
    pagesCount: 547,
    chunksCount: 1640,
    status: 'ready',
    processingProgress: 100,
    summary: 'Unanimous 9-judge Constitution Bench ruling affirming privacy as a fundamental right under Article 21, establishing the four-fold proportionality test for state interference.',
    createdAt: '2026-09-26T09:30:00Z'
  },
  {
    id: 'doc-kesavananda-1973',
    title: 'Kesavananda Bharati v. State of Kerala',
    citation: '(1973) 4 SCC 225',
    court: 'Supreme Court of India',
    jurisdiction: 'India',
    date: '1973',
    category: 'Constitutional Law',
    fileName: 'Kesavananda_Bharati_1973.pdf',
    fileSizeBytes: 5120300,
    pagesCount: 135,
    chunksCount: 412,
    status: 'ready',
    processingProgress: 100,
    summary: 'Historic constitutional ruling establishing the Basic Structure Doctrine, holding that Parliament cannot alter the fundamental framework of the Constitution under Article 368.',
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
    category: 'Contract Law',
    title: 'Liquidated Damages & Proof of Loss (Section 74)',
    query: 'What are the essential legal requirements to enforce a liquidated damages clause under Section 74 of the Indian Contract Act, and can earnest money be forfeited without proving actual loss?',
    relatedDocIds: ['doc-kailash-nath-2015', 'doc-contract-act-1872']
  },
  {
    id: 'q2',
    category: 'Privacy Law',
    title: 'Legitimate Uses & Consent Exceptions (DPDP 2023)',
    query: 'What are the permissible grounds for processing personal data without explicit consent under legitimate uses in the DPDP Act 2023, specifically regarding employment and state subsidies?',
    relatedDocIds: ['doc-dpdp-act-2023']
  },
  {
    id: 'q3',
    category: 'Constitutional Law',
    title: 'Proportionality Standard for Right to Privacy',
    query: 'What standard of scrutiny and proportionality test must state action satisfy when infringing the fundamental right to privacy under Justice K.S. Puttaswamy (2017)?',
    relatedDocIds: ['doc-puttaswamy-2017']
  },
  {
    id: 'q4',
    category: 'Constitutional Law',
    title: 'Limits on Article 368 Amending Power',
    query: 'Can Parliament amend fundamental rights or abrogate judicial review under Article 368 of the Constitution pursuant to Kesavananda Bharati?',
    relatedDocIds: ['doc-kesavananda-1973']
  }
];

export const DEMO_RESEARCH_RESPONSES: Record<string, ResearchAnswerResult> = {
  'q1': {
    queryId: 'qry-contract-sec74-kailash-nath',
    query: 'What are the essential legal requirements to enforce a liquidated damages clause under Section 74 of the Indian Contract Act, and can earnest money be forfeited without proving actual loss?',
    groundedAnswer: `Under Indian contract jurisprudence governed by Section 74 of the Indian Contract Act, 1872, the stipulation of a liquidated damages clause does not grant an automatic entitlement to recover the named sum upon a mere breach [1]. Following the authoritative restatement of law by the Supreme Court in *Kailash Nath Associates v. Delhi Development Authority (2015)*, damages can only be awarded if the claimant has suffered actual damage or loss resulting from the breach [2].

**Key Legal Principles Established:**
1. **Mandatory Proof of Loss:** Where it is possible to prove actual damage or loss, such proof is mandatory and not dispensed with [2].
2. **Ceiling on Recovery:** The sum named in the contract represents only an upper limit; courts are empowered to award only reasonable compensation [3].
3. **Forfeiture of Earnest Money:** Forfeiture is governed by Section 74. Where the promisee suffers no actual loss (such as when a subsequent re-auction generates a higher surplus), forfeiture of the deposit constitutes an impermissible penalty [4].
4. **Pre-estimates of Damage:** Liquidated damages without proof of loss are permissible only in narrow circumstances where ascertainment of actual damage is impossible or difficult to prove [2].`,
    supportingPassages: [
      {
        id: 'pass-kn-para43',
        documentId: 'doc-kailash-nath-2015',
        documentTitle: 'Kailash Nath Associates v. Delhi Development Authority',
        citation: '(2015) 4 SCC 136',
        court: 'Supreme Court of India',
        date: '2015',
        pageNumber: 14,
        paragraphNumber: 'Paragraph 43.1',
        excerpt: 'Section 74 applies where damage or loss is caused by breach of contract. Where it is possible to prove actual damage or loss, such proof is not dispensed with. It is only in cases where damage or loss is impossible or difficult to prove that the liquidated amount, if it is a genuine pre-estimate, can be awarded. Compensation awarded under Section 74 must be reasonable.',
        retrievalMethod: 'hybrid_reranked',
        combinedScore: 0.965
      },
      {
        id: 'pass-ica-s74',
        documentId: 'doc-contract-act-1872',
        documentTitle: 'The Indian Contract Act, 1872',
        citation: 'Act IX of 1872',
        court: 'Statute',
        date: '1872',
        pageNumber: 31,
        paragraphNumber: 'Section 74',
        excerpt: '74. Compensation for breach of contract where penalty stipulated for.—When a contract has been broken, if a sum is named in the contract as the amount to be paid in case of such breach... the party complaining of the breach is entitled to receive from the party who has broken the contract reasonable compensation not exceeding the amount so named.',
        retrievalMethod: 'bm25',
        combinedScore: 0.921
      },
      {
        id: 'pass-kn-forfeiture',
        documentId: 'doc-kailash-nath-2015',
        documentTitle: 'Kailash Nath Associates v. Delhi Development Authority',
        citation: '(2015) 4 SCC 136',
        court: 'Supreme Court of India',
        date: '2015',
        pageNumber: 18,
        paragraphNumber: 'Paragraph 44',
        excerpt: 'Since DDA did not suffer any loss when the subsequent auction of the plot fetched Rs. 11.75 crores against the earlier bid of Rs. 3.12 crores, forfeiture of the earnest money of Rs. 78,00,000/- was held to be illegal and contrary to Section 74, as no loss was suffered by the Authority.',
        retrievalMethod: 'hybrid_reranked',
        combinedScore: 0.898
      }
    ],
    citations: [
      {
        id: 'cit-1',
        marker: '[1]',
        claimText: 'Liquidated damages clause does not grant an automatic entitlement to recover the named sum upon a mere breach.',
        sourceDocumentId: 'doc-contract-act-1872',
        sourceDocumentTitle: 'The Indian Contract Act, 1872',
        sourcePage: 31,
        sourceParagraph: 'Section 74',
        sourceExcerpt: 'The party complaining of the breach is entitled... to receive from the party who has broken the contract reasonable compensation not exceeding the amount so named.',
        verificationStatus: 'verified',
        confidenceScore: 0.97,
        verificationRationale: 'Direct statutory entailment. Section 74 substitutes reasonable compensation for automatic contractual penalties.',
        entailmentType: 'direct_entailment'
      },
      {
        id: 'cit-2',
        marker: '[2]',
        claimText: 'Damages can only be awarded if actual loss occurred, and where possible to prove, such proof is mandatory.',
        sourceDocumentId: 'doc-kailash-nath-2015',
        sourceDocumentTitle: 'Kailash Nath Associates v. DDA, (2015) 4 SCC 136',
        sourcePage: 14,
        sourceParagraph: 'Paragraph 43.1',
        sourceExcerpt: 'Where it is possible to prove actual damage or loss, such proof is not dispensed with. It is only in cases where damage or loss is impossible or difficult to prove that the liquidated amount can be awarded.',
        verificationStatus: 'verified',
        confidenceScore: 0.99,
        verificationRationale: 'Exact ratio entailment matching the authoritative holding in Paragraph 43.1.',
        entailmentType: 'direct_entailment'
      },
      {
        id: 'cit-3',
        marker: '[3]',
        claimText: 'The sum named represents only an upper limit and courts are bound to award reasonable compensation.',
        sourceDocumentId: 'doc-contract-act-1872',
        sourceDocumentTitle: 'The Indian Contract Act, 1872',
        sourcePage: 31,
        sourceParagraph: 'Section 74',
        sourceExcerpt: 'reasonable compensation not exceeding the amount so named or, as the case may be, the penalty stipulated for.',
        verificationStatus: 'verified',
        confidenceScore: 0.96,
        verificationRationale: 'Directly corroborated by statutory wording "not exceeding the amount so named".',
        entailmentType: 'direct_entailment'
      },
      {
        id: 'cit-4',
        marker: '[4]',
        claimText: 'Where the promisee suffers no loss whatsoever, forfeiture of earnest money is treated as an unenforceable penalty.',
        sourceDocumentId: 'doc-kailash-nath-2015',
        sourceDocumentTitle: 'Kailash Nath Associates v. DDA, (2015) 4 SCC 136',
        sourcePage: 18,
        sourceParagraph: 'Paragraph 44',
        sourceExcerpt: 'Since DDA did not suffer any loss when the subsequent auction of the plot fetched Rs. 11.75 crores... forfeiture of earnest money was held illegal.',
        verificationStatus: 'verified',
        confidenceScore: 0.98,
        verificationRationale: 'Entailed by factual ratio holding that unproven loss precludes forfeiture under Section 74.',
        entailmentType: 'direct_entailment'
      }
    ],
    pipelineMetadata: {
      preprocessingTimeMs: 28,
      retrievalStrategy: 'Hybrid Legal Retrieval',
      bm25CandidatesCount: 32,
      semanticCandidatesCount: 26,
      rerankedPassagesCount: 3,
      ollamaModel: 'Llama 3 (Ollama)',
      generationTimeMs: 1340,
      verificationTimeMs: 410,
      totalLatencyMs: 1806,
      fusionMethod: 'Reciprocal Rank Fusion'
    },
    timestamp: '2026-09-26T12:00:00Z'
  },

  'q2': {
    queryId: 'qry-dpdp-legitimate-uses-2023',
    query: 'What are the permissible grounds for processing personal data without explicit consent under legitimate uses in the DPDP Act 2023, specifically regarding employment and state subsidies?',
    groundedAnswer: `Under Section 7 of the Digital Personal Data Protection Act, 2023 (DPDP Act), personal data may be processed without obtaining explicit consent for specified 'certain legitimate uses' [1].

**Permissible Statutory Grounds:**
1. **Voluntary Provision:** Where data is voluntarily provided by the Data Principal for a specified purpose without objection [2].
2. **State Subsidies & Licences:** For the delivery of government subsidies, benefits, certificates, licences, or permits [3].
3. **Employment Purposes:** For employment management, safeguarding corporate trade secrets, and prevention of liability [4].
4. **Legal Compliance & Safety:** Compliance with judicial orders, medical response during life-threatening health emergencies, and disaster response [1].

While explicit consent is not required under Section 7, the Data Fiduciary remains bound by reasonable security obligations and breach notification standards [1].`,
    supportingPassages: [
      {
        id: 'pass-dpdp-s7',
        documentId: 'doc-dpdp-act-2023',
        documentTitle: 'Digital Personal Data Protection Act, 2023',
        citation: 'Act No. 22 of 2023',
        court: 'Statute / Parliament of India',
        date: '2023',
        pageNumber: 6,
        paragraphNumber: 'Section 7',
        excerpt: '7. Certain legitimate uses.—A Data Fiduciary may process personal data of a Data Principal for any of the following uses: (a) for specified purpose for which the Data Principal has voluntarily provided data... (b) for the State to provide or issue subsidy, benefit, certificate... (i) for the purposes of employment or those related to safeguarding the employer from loss.',
        retrievalMethod: 'hybrid_reranked',
        combinedScore: 0.982
      }
    ],
    citations: [
      {
        id: 'cit-dpdp-1',
        marker: '[1]',
        claimText: 'Personal data may be processed for specific legitimate uses without explicit consent.',
        sourceDocumentId: 'doc-dpdp-act-2023',
        sourceDocumentTitle: 'Digital Personal Data Protection Act, 2023',
        sourcePage: 6,
        sourceParagraph: 'Section 7',
        sourceExcerpt: 'A Data Fiduciary may process personal data of a Data Principal for any of the following uses...',
        verificationStatus: 'verified',
        confidenceScore: 0.98,
        verificationRationale: 'Direct statutory entailment from Section 7 opening clause.',
        entailmentType: 'direct_entailment'
      },
      {
        id: 'cit-dpdp-2',
        marker: '[2]',
        claimText: 'Voluntary provision of data for a specified purpose constitutes legitimate use.',
        sourceDocumentId: 'doc-dpdp-act-2023',
        sourceDocumentTitle: 'Digital Personal Data Protection Act, 2023',
        sourcePage: 6,
        sourceParagraph: 'Section 7(a)',
        sourceExcerpt: 'for the specified purpose for which the Data Principal has voluntarily provided her personal data to the Data Fiduciary.',
        verificationStatus: 'verified',
        confidenceScore: 0.99,
        verificationRationale: 'Direct match with Section 7(a) text.',
        entailmentType: 'direct_entailment'
      },
      {
        id: 'cit-dpdp-3',
        marker: '[3]',
        claimText: 'Processing permissible for government subsidies, benefits, certificates, and licences.',
        sourceDocumentId: 'doc-dpdp-act-2023',
        sourceDocumentTitle: 'Digital Personal Data Protection Act, 2023',
        sourcePage: 6,
        sourceParagraph: 'Section 7(b)',
        sourceExcerpt: 'for the State and any of its instrumentalities to provide or issue to the Data Principal such subsidy, benefit, service, certificate, licence or permit.',
        verificationStatus: 'verified',
        confidenceScore: 0.99,
        verificationRationale: 'Direct statutory match with Section 7(b).',
        entailmentType: 'direct_entailment'
      },
      {
        id: 'cit-dpdp-4',
        marker: '[4]',
        claimText: 'Processing permissible for employment purposes and safeguarding employers from corporate liability.',
        sourceDocumentId: 'doc-dpdp-act-2023',
        sourceDocumentTitle: 'Digital Personal Data Protection Act, 2023',
        sourcePage: 7,
        sourceParagraph: 'Section 7(i)',
        sourceExcerpt: 'for the purposes of employment or those related to safeguarding the employer from loss or liability, such as prevention of corporate espionage.',
        verificationStatus: 'verified',
        confidenceScore: 0.98,
        verificationRationale: 'Exact alignment with Section 7(i).',
        entailmentType: 'direct_entailment'
      }
    ],
    pipelineMetadata: {
      preprocessingTimeMs: 24,
      retrievalStrategy: 'Hybrid Legal Retrieval',
      bm25CandidatesCount: 22,
      semanticCandidatesCount: 19,
      rerankedPassagesCount: 2,
      ollamaModel: 'Llama 3 (Ollama)',
      generationTimeMs: 1180,
      verificationTimeMs: 340,
      totalLatencyMs: 1568,
      fusionMethod: 'Reciprocal Rank Fusion'
    },
    timestamp: '2026-09-26T12:05:00Z'
  },

  'q3': {
    queryId: 'qry-puttaswamy-privacy-proportionality',
    query: 'What standard of scrutiny and proportionality test must state action satisfy when infringing the fundamental right to privacy under Justice K.S. Puttaswamy (2017)?',
    groundedAnswer: `In *Justice K.S. Puttaswamy (Retd.) v. Union of India (2017)*, a 9-judge Constitution Bench held that privacy is an inalienable fundamental right protected under Article 21 and Part III of the Constitution [1].

**The Proportionality Framework for State Interference:**
1. **Legality:** The action must be backed by an express, valid statutory enactment [2].
2. **Legitimate State Aim:** The measure must pursue a legitimate public objective such as national security or crime prevention [3].
3. **Rational Nexus:** A rational connection must exist between the infringing measure and the statutory goal [2].
4. **Proportionality & Safeguards:** The degree of interference must be proportionate to the objective, supported by procedural guarantees against executive abuse [4].`,
    supportingPassages: [
      {
        id: 'pass-putt-para310',
        documentId: 'doc-puttaswamy-2017',
        documentTitle: 'Justice K.S. Puttaswamy (Retd.) v. Union of India',
        citation: '(2017) 10 SCC 1',
        court: 'Supreme Court of India',
        date: '2017',
        pageNumber: 264,
        paragraphNumber: 'Paragraph 310',
        excerpt: 'An invasion of life or personal liberty must meet the threefold requirement of (i) legality, which postulates the existence of law; (ii) need, defined in terms of a legitimate state aim; and (iii) proportionality which ensures a rational nexus between the objects and the means adopted to achieve them.',
        retrievalMethod: 'hybrid_reranked',
        combinedScore: 0.985
      }
    ],
    citations: [
      {
        id: 'cit-putt-1',
        marker: '[1]',
        claimText: 'Privacy is an inalienable fundamental right protected under Article 21.',
        sourceDocumentId: 'doc-puttaswamy-2017',
        sourceDocumentTitle: 'Justice K.S. Puttaswamy v. UOI, (2017) 10 SCC 1',
        sourcePage: 264,
        sourceParagraph: 'Paragraph 310',
        sourceExcerpt: 'The right to privacy is protected as an intrinsic part of the right to life and personal liberty under Article 21.',
        verificationStatus: 'verified',
        confidenceScore: 0.99,
        verificationRationale: 'Direct ratio established by the 9-judge Constitution Bench.',
        entailmentType: 'direct_entailment'
      },
      {
        id: 'cit-putt-2',
        marker: '[2]',
        claimText: 'State encroachment must satisfy legality and rational connection (suitability).',
        sourceDocumentId: 'doc-puttaswamy-2017',
        sourceDocumentTitle: 'Justice K.S. Puttaswamy v. UOI, (2017) 10 SCC 1',
        sourcePage: 264,
        sourceParagraph: 'Paragraph 310',
        sourceExcerpt: 'legality, which postulates the existence of law; and proportionality which ensures a rational nexus.',
        verificationStatus: 'verified',
        confidenceScore: 0.98,
        verificationRationale: 'Direct textual entailment from Paragraph 310.',
        entailmentType: 'direct_entailment'
      },
      {
        id: 'cit-putt-3',
        marker: '[3]',
        claimText: 'The measure must pursue a legitimate state goal.',
        sourceDocumentId: 'doc-puttaswamy-2017',
        sourceDocumentTitle: 'Justice K.S. Puttaswamy v. UOI, (2017) 10 SCC 1',
        sourcePage: 264,
        sourceParagraph: 'Paragraph 310',
        sourceExcerpt: 'need, defined in terms of a legitimate state aim.',
        verificationStatus: 'verified',
        confidenceScore: 0.99,
        verificationRationale: 'Direct judicial ratio.',
        entailmentType: 'direct_entailment'
      },
      {
        id: 'cit-putt-4',
        marker: '[4]',
        claimText: 'The degree of interference must be proportionate with procedural guarantees against abuse.',
        sourceDocumentId: 'doc-puttaswamy-2017',
        sourceDocumentTitle: 'Justice K.S. Puttaswamy v. UOI, (2017) 10 SCC 1',
        sourcePage: 489,
        sourceParagraph: 'Paragraph 638',
        sourceExcerpt: 'the extent of such interference must be proportionate to the need for such interference, with procedural guarantees against abuse.',
        verificationStatus: 'verified',
        confidenceScore: 0.97,
        verificationRationale: 'Corroborated by concurrent opinion of Justice Kaul.',
        entailmentType: 'direct_entailment'
      }
    ],
    pipelineMetadata: {
      preprocessingTimeMs: 35,
      retrievalStrategy: 'Hybrid Legal Retrieval',
      bm25CandidatesCount: 45,
      semanticCandidatesCount: 38,
      rerankedPassagesCount: 2,
      ollamaModel: 'Llama 3 (Ollama)',
      generationTimeMs: 1490,
      verificationTimeMs: 420,
      totalLatencyMs: 1980,
      fusionMethod: 'Reciprocal Rank Fusion'
    },
    timestamp: '2026-09-26T12:10:00Z'
  },

  'q4': {
    queryId: 'qry-kesavananda-basic-structure',
    query: 'Can Parliament amend fundamental rights or abrogate judicial review under Article 368 of the Constitution pursuant to Kesavananda Bharati?',
    groundedAnswer: `In the historic 13-judge decision in *Kesavananda Bharati v. State of Kerala (1973)*, the Supreme Court held that while Parliament holds broad constituent power to amend the Constitution under Article 368, such power does not extend to altering or destroying its 'Basic Structure' [1].

**Key Constitutional Holdings:**
1. **Inherent Amending Limitation:** The power to amend implies the preservation of constitutional identity rather than total revision or abrogation [2].
2. **Fundamental Rights Flexibility:** Fundamental rights may be amended to achieve socio-economic objectives, provided essential constitutional values remain intact [3].
3. **Judicial Review as Basic Structure:** Constitutional judicial review under Articles 32 and 226 is an inviolable basic structure feature that cannot be ousted by amendment [4].`,
    supportingPassages: [
      {
        id: 'pass-kes-ratio',
        documentId: 'doc-kesavananda-1973',
        documentTitle: 'Kesavananda Bharati v. State of Kerala',
        citation: '(1973) 4 SCC 225',
        court: 'Supreme Court of India',
        date: '1973',
        pageNumber: 1,
        paragraphNumber: 'Majority Summary',
        excerpt: 'Article 368 does not enable Parliament to alter the basic structure or framework of the Constitution. The majority holding recognizes inherent limitations upon the amending power.',
        retrievalMethod: 'hybrid_reranked',
        combinedScore: 0.991
      }
    ],
    citations: [
      {
        id: 'cit-kes-1',
        marker: '[1]',
        claimText: 'Parliament cannot alter, destroy, or abrogate the Basic Structure of the Constitution.',
        sourceDocumentId: 'doc-kesavananda-1973',
        sourceDocumentTitle: 'Kesavananda Bharati v. State of Kerala, (1973) 4 SCC 225',
        sourcePage: 1,
        sourceParagraph: 'Majority View',
        sourceExcerpt: 'Article 368 does not enable Parliament to alter the basic structure or framework of the Constitution.',
        verificationStatus: 'verified',
        confidenceScore: 1.0,
        verificationRationale: 'Direct core holding signed by 9 majority judges.',
        entailmentType: 'direct_entailment'
      },
      {
        id: 'cit-kes-2',
        marker: '[2]',
        claimText: 'The power to amend implies preservation of constitutional identity.',
        sourceDocumentId: 'doc-kesavananda-1973',
        sourceDocumentTitle: 'Kesavananda Bharati v. State of Kerala, (1973) 4 SCC 225',
        sourcePage: 82,
        sourceParagraph: 'Khanna J.',
        sourceExcerpt: 'The word "amendment" postulates that the old Constitution survives without loss of identity.',
        verificationStatus: 'verified',
        confidenceScore: 0.98,
        verificationRationale: 'Verbatim alignment with Justice H.R. Khanna judgment.',
        entailmentType: 'direct_entailment'
      },
      {
        id: 'cit-kes-3',
        marker: '[3]',
        claimText: 'Fundamental rights may be amended provided core essential features remain intact.',
        sourceDocumentId: 'doc-kesavananda-1973',
        sourceDocumentTitle: 'Kesavananda Bharati v. State of Kerala, (1973) 4 SCC 225',
        sourcePage: 85,
        sourceParagraph: 'Khanna J.',
        sourceExcerpt: 'No part of the Constitution, including Part III, is completely exempt from amendment, subject to the basic structure test.',
        verificationStatus: 'verified',
        confidenceScore: 0.95,
        verificationRationale: 'Directly supported by majority resolution on Part III scope.',
        entailmentType: 'direct_entailment'
      },
      {
        id: 'cit-kes-4',
        marker: '[4]',
        claimText: 'Constitutional judicial review is an inviolable basic structure feature.',
        sourceDocumentId: 'doc-kesavananda-1973',
        sourceDocumentTitle: 'Kesavananda Bharati v. State of Kerala, (1973) 4 SCC 225',
        sourcePage: 110,
        sourceParagraph: 'Shelat J.',
        sourceExcerpt: 'The power of judicial review of legislation and executive action is an essential feature of our constitutional scheme.',
        verificationStatus: 'verified',
        confidenceScore: 0.97,
        verificationRationale: 'Direct holding on judicial supremacy and separation of powers.',
        entailmentType: 'direct_entailment'
      }
    ],
    pipelineMetadata: {
      preprocessingTimeMs: 30,
      retrievalStrategy: 'Hybrid Legal Retrieval',
      bm25CandidatesCount: 40,
      semanticCandidatesCount: 35,
      rerankedPassagesCount: 2,
      ollamaModel: 'Llama 3 (Ollama)',
      generationTimeMs: 1390,
      verificationTimeMs: 390,
      totalLatencyMs: 1845,
      fusionMethod: 'Reciprocal Rank Fusion'
    },
    timestamp: '2026-09-26T12:15:00Z'
  }
};

/**
 * Dynamic fallback generator for custom user queries in Demo Mode
 */
export function generateDynamicDemoAnswer(
  customQuery: string, 
  availableDocs: LegalDocument[] = DEMO_DOCUMENTS
): ResearchAnswerResult {
  const queryLower = customQuery.toLowerCase();
  
  if (queryLower.includes('liquidat') || queryLower.includes('section 74') || queryLower.includes('contract') || queryLower.includes('earnest money') || queryLower.includes('kailash')) {
    return { ...DEMO_RESEARCH_RESPONSES['q1'], query: customQuery };
  }
  if (queryLower.includes('dpdp') || queryLower.includes('data protection') || queryLower.includes('legitimate use') || queryLower.includes('consent') || queryLower.includes('privacy')) {
    return { ...DEMO_RESEARCH_RESPONSES['q2'], query: customQuery };
  }
  if (queryLower.includes('puttaswamy') || queryLower.includes('proportionality') || queryLower.includes('article 21')) {
    return { ...DEMO_RESEARCH_RESPONSES['q3'], query: customQuery };
  }
  if (queryLower.includes('kesavananda') || queryLower.includes('basic structure') || queryLower.includes('article 368')) {
    return { ...DEMO_RESEARCH_RESPONSES['q4'], query: customQuery };
  }

  const primaryDoc = availableDocs[0] || DEMO_DOCUMENTS[0];
  const secondaryDoc = availableDocs[1] || DEMO_DOCUMENTS[1];

  return {
    queryId: `qry-dyn-${Date.now()}`,
    query: customQuery,
    groundedAnswer: `Based on the verified legal corpus regarding "${customQuery}":

**1. Governing Statutory Framework & Legal Ratio:**
Under the applicable legal standards (${primaryDoc.title}), claims require strict compliance with governing conditions precedent [1]. Precedent establishes that legal assertions without supporting documentation cannot sustain relief [2].

**2. Standard of Proof & Evidentiary Requirements:**
Pursuant to judicial interpretations in *${secondaryDoc.title}*, evidence must demonstrate direct causation rather than speculative inference [3]. Where statutory provisions designate specific procedures, alternative mechanisms remain invalid [4].

**3. Judicial Relief & Enforcement:**
Courts assess both substantive merits and procedural compliance before granting equitable or compensatory remedies [1].`,
    supportingPassages: [
      {
        id: `pass-dyn-1`,
        documentId: primaryDoc.id,
        documentTitle: primaryDoc.title,
        citation: primaryDoc.citation,
        court: primaryDoc.court,
        date: primaryDoc.date,
        pageNumber: 12,
        paragraphNumber: 'Section 14',
        excerpt: 'The statutory mandate requires strict verification of conditions precedent. Where legal duties are prescribed by statute, non-compliance renders subsequent executive actions ultra vires and invalid in the eyes of law.',
        retrievalMethod: 'hybrid_reranked',
        combinedScore: 0.912
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
        excerpt: 'Judicial discretion in granting relief is circumscribed by the governing enactment. Precedent requires clear evidence of direct causation before compensatory damages or injunctive relief can be granted.',
        retrievalMethod: 'bm25',
        combinedScore: 0.854
      }
    ],
    citations: [
      {
        id: 'cit-dyn-1',
        marker: '[1]',
        claimText: 'Claims require strict compliance with governing conditions precedent and procedural propriety.',
        sourceDocumentId: primaryDoc.id,
        sourceDocumentTitle: primaryDoc.title,
        sourcePage: 12,
        sourceExcerpt: 'The statutory mandate requires strict verification of conditions precedent.',
        verificationStatus: 'verified',
        confidenceScore: 0.95,
        verificationRationale: 'Direct semantic entailment between stated claim and statutory passage.',
        entailmentType: 'direct_entailment'
      },
      {
        id: 'cit-dyn-2',
        marker: '[2]',
        claimText: 'Legal assertions without supporting documentation cannot sustain relief.',
        sourceDocumentId: primaryDoc.id,
        sourceDocumentTitle: primaryDoc.title,
        sourcePage: 12,
        sourceExcerpt: 'non-compliance renders subsequent executive actions ultra vires and invalid in the eyes of law.',
        verificationStatus: 'partially_verified',
        confidenceScore: 0.81,
        verificationRationale: 'Partially verified: Source text emphasizes ultra vires principle; claim applies principle to evidentiary assertions.',
        entailmentType: 'partial_support'
      },
      {
        id: 'cit-dyn-3',
        marker: '[3]',
        claimText: 'Evidence must demonstrate direct causation rather than speculative inference.',
        sourceDocumentId: secondaryDoc.id,
        sourceDocumentTitle: secondaryDoc.title,
        sourcePage: 24,
        sourceExcerpt: 'Precedent requires clear evidence of direct causation before compensatory damages or injunctive relief can be granted.',
        verificationStatus: 'verified',
        confidenceScore: 0.98,
        verificationRationale: 'High confidence match with Paragraph 32 judicial ratio.',
        entailmentType: 'direct_entailment'
      },
      {
        id: 'cit-dyn-4',
        marker: '[4]',
        claimText: 'Where statutory provisions designate specific procedures, alternative mechanisms remain invalid.',
        sourceDocumentId: secondaryDoc.id,
        sourceDocumentTitle: secondaryDoc.title,
        sourcePage: 24,
        sourceExcerpt: 'Judicial discretion in granting relief is circumscribed by the governing enactment.',
        verificationStatus: 'verified',
        confidenceScore: 0.91,
        verificationRationale: 'Entailed by statutory limitation doctrine.',
        entailmentType: 'direct_entailment'
      }
    ],
    pipelineMetadata: {
      preprocessingTimeMs: 29,
      retrievalStrategy: 'Hybrid Legal Retrieval',
      bm25CandidatesCount: 24,
      semanticCandidatesCount: 22,
      rerankedPassagesCount: 2,
      ollamaModel: 'Llama 3 (Ollama)',
      generationTimeMs: 1250,
      verificationTimeMs: 360,
      totalLatencyMs: 1669,
      fusionMethod: 'Reciprocal Rank Fusion'
    },
    timestamp: new Date().toISOString()
  };
}
