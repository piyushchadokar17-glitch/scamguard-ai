
CREATE TABLE public.analysis_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  input_type TEXT NOT NULL,
  input_content TEXT,
  file_url TEXT,
  risk_score INTEGER NOT NULL,
  verdict TEXT NOT NULL,
  red_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.analysis_reports TO anon, authenticated;
GRANT ALL ON public.analysis_reports TO service_role;
ALTER TABLE public.analysis_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read analysis reports" ON public.analysis_reports FOR SELECT USING (true);
CREATE POLICY "Anyone can insert analysis reports" ON public.analysis_reports FOR INSERT WITH CHECK (true);

CREATE TABLE public.community_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  website TEXT,
  scam_type TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_url TEXT,
  report_count INTEGER NOT NULL DEFAULT 1,
  ai_verified BOOLEAN NOT NULL DEFAULT false,
  ai_risk_score INTEGER,
  ai_category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.community_reports TO anon, authenticated;
GRANT ALL ON public.community_reports TO service_role;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read community reports" ON public.community_reports FOR SELECT USING (true);
CREATE POLICY "Anyone can insert community reports" ON public.community_reports FOR INSERT WITH CHECK (true);

INSERT INTO public.community_reports (company_name, website, scam_type, description, report_count, ai_verified, ai_risk_score, ai_category) VALUES
('ABC Tech Solutions', 'abctechsolutions.fake.co', 'Fake Internship', 'Promised a paid remote research internship. Required a $50 "onboarding fee" for software access that never materialized.', 47, true, 92, 'Fake Internship'),
('Global Research Index', 'global-research-pay.org', 'Predatory Journal', 'Aggressive email solicitation for paper submission. Charges high APC fees with no peer review process or archival reliability.', 12, true, 85, 'Predatory Journal'),
('Scholarship Direct', 'apply.scholarship-direct.xyz', 'Phishing Site', 'Asks for sensitive personal information including social security numbers for "eligibility verification" for fake grants.', 84, true, 95, 'Phishing Site');
