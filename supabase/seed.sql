insert into public.reports (
    id,
    slug,
    title,
    description,
    category,
    tags,
    read_time_minutes,
    published_at,
    author,
    views,
    downloads,
    image_path,
    cover_image_path,
    highlight,
    quote,
    metrics,
    source_type,
    status,
    featured
)
values
    (
        '7ae9db3d-1f1c-468f-a6a4-2d3d0bda0f11',
        'climate-volatility-niger-delta',
        'Socio-Ecological Impact of Climate Volatility in the Niger Delta',
        'A long-form regional brief mapping climate pressure, migration shifts, and resilience interventions across southern Nigeria.',
        array['Regional Analysis', 'Climate Resilience'],
        array['Niger Delta', 'Policy Brief', 'Biodiversity', 'Hydro-met'],
        12,
        '2024-10-24T09:00:00Z',
        'Dr. Amara Okafor',
        12800,
        4300,
        '/coset-eye-banner.jpg',
        '/coset-eye-banner.jpg',
        array[
            '34% increase in coastal erosion rates',
            'Migration patterns shifting northwards',
            'Local governance intervention effectiveness down 12%'
        ],
        'The crisis in the Delta is not just an environmental failure; it is the systematic erosion of a millennium-old social fabric by invisible climatic hands.',
        jsonb_build_array(
            jsonb_build_object('label', 'Sea Level Rise', 'value', '+1.2m', 'note', 'Projected variance by 2055 based on RCP 8.5 modelling.'),
            jsonb_build_object('label', 'Livelihood Loss', 'value', '42%', 'note', 'Fishery yield reduction observed in littoral zones.')
        ),
        'upload',
        'published',
        true
    ),
    (
        'f3ee633d-5eb0-4514-a89f-2b0b5a9a6ac4',
        'ending-gas-flaring-nigeria',
        'Ending Gas Flaring in Nigeria: Socio-Ecological Impacts',
        'A technical policy brief on gas flaring, public health exposure, and the regulatory pathways for reinjection and commercialization.',
        array['Policy Brief', 'Environmental Justice'],
        array['Gas Flaring', 'Regulation', 'Niger Delta'],
        14,
        '2024-10-24T10:00:00Z',
        'CoSET Research Lab',
        9600,
        5100,
        '/community-engagement.jpg',
        '/community-engagement.jpg',
        array[
            '16,000 active sites identified',
            '20+ policy actors mapped',
            '12% efficiency gains in flare mitigation pilots'
        ],
        'Energy transition in the Delta requires environmental repair to be treated as social repair, not as an industrial afterthought.',
        jsonb_build_array(
            jsonb_build_object('label', 'Community Exposure', 'value', '2.1M', 'note', 'Estimated people living within elevated exposure corridors.'),
            jsonb_build_object('label', 'Flaring Reduction', 'value', '18%', 'note', 'Observed drop in monitored pilot zones year-on-year.')
        ),
        'upload',
        'published',
        false
    ),
    (
        '15de5882-0d4d-4d1a-9767-5206d0b2157a',
        'renewable-transition-matrix',
        'Renewable Transition Matrix',
        'Framework for rural solar adoption in West African economies, with investment and livelihood readiness indicators.',
        array['Data Brief', 'Energy'],
        array['Renewables', 'Infrastructure', 'Policy Reform'],
        10,
        '2024-02-12T08:30:00Z',
        'Ijeoma Bello',
        7400,
        2600,
        '/CoSET-5-600x540.png',
        '/CoSET-5-600x540.png',
        array[
            'Regional adoption signals rising',
            'Financing gaps narrowing',
            'Grid reliability remains the main risk'
        ],
        'The transition challenge is no longer whether solar is viable; it is whether institutions can move quickly enough to absorb it.',
        jsonb_build_array(
            jsonb_build_object('label', 'Adoption Readiness', 'value', '68%', 'note', 'Composite readiness score across six pilot states.'),
            jsonb_build_object('label', 'Capex Efficiency', 'value', '31%', 'note', 'Projected savings under distributed deployment.')
        ),
        'upload',
        'draft',
        false
    )
on conflict (id) do update
set slug = excluded.slug,
    title = excluded.title,
    description = excluded.description,
    category = excluded.category,
    tags = excluded.tags,
    read_time_minutes = excluded.read_time_minutes,
    published_at = excluded.published_at,
    author = excluded.author,
    views = excluded.views,
    downloads = excluded.downloads,
    image_path = excluded.image_path,
    cover_image_path = excluded.cover_image_path,
    highlight = excluded.highlight,
    quote = excluded.quote,
    metrics = excluded.metrics,
    source_type = excluded.source_type,
    status = excluded.status,
    featured = excluded.featured;

insert into public.blog_posts (
    id,
    slug,
    title,
    excerpt,
    category,
    author,
    image_path,
    status,
    featured,
    published_at
)
values
    (
        'efd30fb7-c133-4ad4-9d30-6ee502e0df1b',
        'post-cop28-reflection',
        'CoSET''s Post-COP28 Reflection: A Turning Point?',
        'A sober reading of the policy signals that emerged after COP28 and what they mean for local climate justice coalitions.',
        'Policy Update',
        'Sarah Chen',
        '/coset-eye-banner.jpg',
        'published',
        true,
        '2024-11-24T09:00:00Z'
    ),
    (
        '46d8d1be-8f79-4d78-a455-b0a3f3220fb4',
        'divestment-for-just-transition',
        'Overview of Divestment for Just Transition',
        'Examining how major institutional funds are shifting focus toward equitable green energy and accountability.',
        'Finance',
        'Marcus Thorne',
        '/community-engagement.jpg',
        'published',
        false,
        '2024-11-11T09:00:00Z'
    ),
    (
        '83c0f645-c5f9-4818-9098-74a0d7475887',
        'biodiversity-credit-market',
        'The Biodiversity Credit Market: Hype vs Reality',
        'A close look at the market structures, incentives, and blind spots shaping biodiversity finance.',
        'Nature-Based',
        'Elena Rodriguez',
        '/CoSET-5-600x540.png',
        'draft',
        false,
        '2024-11-02T09:00:00Z'
    )
on conflict (id) do update
set slug = excluded.slug,
    title = excluded.title,
    excerpt = excluded.excerpt,
    category = excluded.category,
    author = excluded.author,
    image_path = excluded.image_path,
    status = excluded.status,
    featured = excluded.featured,
    published_at = excluded.published_at;

insert into public.report_ingestions (
    id,
    report_id,
    file_name,
    mime_type,
    file_size,
    storage_path,
    extracted_text,
    ai_draft,
    status
)
values
    (
        'ad935f56-ab1d-42f5-93ef-2b6b5946c0e9',
        '7ae9db3d-1f1c-468f-a6a4-2d3d0bda0f11',
        'niger-delta-climate-brief.pdf',
        'application/pdf',
        2483200,
        'report-uploads/niger-delta-climate-brief.pdf',
        'Seeded extraction preview for the Niger Delta climate brief.',
        jsonb_build_object(
            'title', 'Socio-Ecological Impact of Climate Volatility in the Niger Delta',
            'summary', 'Seeded AI draft metadata for local development.',
            'category', jsonb_build_array('Regional Analysis', 'Climate Resilience'),
            'tags', jsonb_build_array('Niger Delta', 'Policy Brief', 'Biodiversity', 'Hydro-met')
        ),
        'completed'
    )
on conflict (id) do update
set report_id = excluded.report_id,
    file_name = excluded.file_name,
    mime_type = excluded.mime_type,
    file_size = excluded.file_size,
    storage_path = excluded.storage_path,
    extracted_text = excluded.extracted_text,
    ai_draft = excluded.ai_draft,
    status = excluded.status;