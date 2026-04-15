export type Report = {
    id: string;
    slug: string;
    title: string;
    description: string;
    category: string[];
    tags: string[];
    readTime: string;
    publishedAt: string;
    author: string;
    views: string;
    downloads: string;
    image: string;
    highlight: string[];
    quote: string;
    metrics: { label: string; value: string; note: string }[];
    html_content?: string | null;
    downloadHref?: string | null;
};

export const reports: Report[] = [
    {
        id: 'rpt-001',
        slug: 'climate-volatility-niger-delta',
        title: 'Socio-Ecological Impact of Climate Volatility in the Niger Delta',
        description:
            'A long-form regional brief mapping climate pressure, migration shifts, and resilience interventions across southern Nigeria.',
        category: ['Regional Analysis', 'Climate Resilience'],
        tags: ['Niger Delta', 'Policy Brief', 'Biodiversity', 'Hydro-met'],
        readTime: '12 min read',
        publishedAt: 'Oct 24, 2024',
        author: 'Dr. Amara Okafor',
        views: '12.8k',
        downloads: '4.3k',
        image: '/coset-eye-banner.jpg',
        highlight: [
            '34% increase in coastal erosion rates',
            'Migration patterns shifting northwards',
            'Local governance intervention effectiveness down 12%',
        ],
        quote:
            'The crisis in the Delta is not just an environmental failure; it is the systematic erosion of a millennium-old social fabric by invisible climatic hands.',
        metrics: [
            {
                label: 'Sea Level Rise',
                value: '+1.2m',
                note: 'Projected variance by 2055 based on RCP 8.5 modelling.',
            },
            {
                label: 'Livelihood Loss',
                value: '42%',
                note: 'Fishery yield reduction observed in littoral zones.',
            },
        ],
    },
    {
        id: 'rpt-002',
        slug: 'ending-gas-flaring-nigeria',
        title: 'Ending Gas Flaring in Nigeria: Socio-Ecological Impacts',
        description:
            'A technical policy brief on gas flaring, public health exposure, and the regulatory pathways for reinjection and commercialization.',
        category: ['Policy Brief', 'Environmental Justice'],
        tags: ['Gas Flaring', 'Regulation', 'Niger Delta'],
        readTime: '14 min read',
        publishedAt: 'Oct 24, 2024',
        author: 'CoSET Research Lab',
        views: '9.6k',
        downloads: '5.1k',
        image: '/community-engagement.jpg',
        highlight: [
            '16,000 active sites identified',
            '20+ policy actors mapped',
            '12% efficiency gains in flare mitigation pilots',
        ],
        quote:
            'Energy transition in the Delta requires environmental repair to be treated as social repair, not as an industrial afterthought.',
        metrics: [
            {
                label: 'Community Exposure',
                value: '2.1M',
                note: 'Estimated people living within elevated exposure corridors.',
            },
            {
                label: 'Flaring Reduction',
                value: '18%',
                note: 'Observed drop in monitored pilot zones year-on-year.',
            },
        ],
    },
    {
        id: 'rpt-003',
        slug: 'renewable-transition-matrix',
        title: 'Renewable Transition Matrix',
        description:
            'Framework for rural solar adoption in West African economies, with investment and livelihood readiness indicators.',
        category: ['Data Brief', 'Energy'],
        tags: ['Renewables', 'Infrastructure', 'Policy Reform'],
        readTime: '10 min read',
        publishedAt: 'Feb 12, 2024',
        author: 'Ijeoma Bello',
        views: '7.4k',
        downloads: '2.6k',
        image: '/CoSET-5-600x540.png',
        highlight: ['Regional adoption signals rising', 'Financing gaps narrowing', 'Grid reliability remains the main risk'],
        quote:
            'The transition challenge is no longer whether solar is viable; it is whether institutions can move quickly enough to absorb it.',
        metrics: [
            { label: 'Adoption Readiness', value: '68%', note: 'Composite readiness score across six pilot states.' },
            { label: 'Capex Efficiency', value: '31%', note: 'Projected savings under distributed deployment.' },
        ],
    },
];

export const blogPosts = [
    {
        title: 'CoSET’s Post-COP28 Reflection: A Turning Point?',
        excerpt:
            'A sober reading of the policy signals that emerged after COP28 and what they mean for local climate justice coalitions.',
        category: 'Policy Update',
        publishedAt: 'Nov 24, 2024',
        author: 'Sarah Chen',
        image: '/coset-eye-banner.jpg',
    },
    {
        title: 'Overview of Divestment for Just Transition',
        excerpt:
            'Examining how major institutional funds are shifting focus toward equitable green energy and accountability.',
        category: 'Finance',
        publishedAt: 'Nov 11, 2024',
        author: 'Marcus Thorne',
        image: '/community-engagement.jpg',
    },
    {
        title: 'The Biodiversity Credit Market: Hype vs Reality',
        excerpt:
            'A close look at the market structures, incentives, and blind spots shaping biodiversity finance.',
        category: 'Nature-Based',
        publishedAt: 'Nov 02, 2024',
        author: 'Elena Rodriguez',
        image: '/CoSET-5-600x540.png',
    },
];

export const adminStats = [
    { label: 'Total Reports', value: '1,482', delta: '+12%', tone: 'navy' },
    { label: 'Active Content', value: '256', delta: '+4%', tone: 'teal' },
    { label: 'Monthly Downloads', value: '42.1k', delta: '-2%', tone: 'slate' },
    { label: 'Processing Status', value: '98.4%', delta: 'Stable', tone: 'ember' },
];

export const adminActivity = [
    {
        title: 'Quarterly Energy Outlook',
        author: 'Sarah Jenkins',
        status: 'Published',
        category: 'Macro-Economics',
        modified: 'Oct 12, 2024',
    },
    {
        title: 'ESG Compliance Standards v2',
        author: 'Marcus Chen',
        status: 'Draft',
        category: 'Regulatory',
        modified: 'Oct 11, 2024',
    },
    {
        title: 'Global Supply Chain Audit',
        author: 'Auto-Ingest System',
        status: 'Processing',
        category: 'Logistics',
        modified: 'Oct 11, 2024',
    },
];

export const filterGroups = {
    categories: ['Climate Resilience', 'Urban Growth', 'Biodiversity', 'Policy Reform'],
    tags: ['Environment', 'Social Justice', 'Policy Brief', 'Hydro-met'],
    regions: ['Niger Delta', 'South South', 'National'],
};

export const cosetOrgLinks = {
    mainSite: 'https://cosetng.org/',
    about: 'https://cosetng.org/about/',
    contact: 'https://cosetng.org/contact/',
    positionPapers: 'https://cosetng.org/position-papers/',
    donate: 'https://cosetng.org/cosetng-donation/',
};

export function getReportBySlug(slug: string) {
    return reports.find((report) => report.slug === slug);
}