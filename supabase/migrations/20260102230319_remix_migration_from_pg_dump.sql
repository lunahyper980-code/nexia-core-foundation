CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  new_workspace_id UUID;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''), NEW.email);
  
  -- Create default workspace
  INSERT INTO public.workspaces (user_id)
  VALUES (NEW.id)
  RETURNING id INTO new_workspace_id;
  
  -- Create default subscription
  INSERT INTO public.subscriptions (user_id, plan_name, status)
  VALUES (NEW.id, 'free', 'active');
  
  -- Log the signup
  INSERT INTO public.activity_logs (workspace_id, type, message)
  VALUES (new_workspace_id, 'user_signup', 'Usuário criou sua conta');
  
  RETURN NEW;
END;
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: activity_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    type text NOT NULL,
    message text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid,
    entity_type text,
    entity_id uuid,
    title text,
    description text
);

ALTER TABLE ONLY public.activity_logs FORCE ROW LEVEL SECURITY;


--
-- Name: authority_strategies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.authority_strategies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    created_by_user_id uuid,
    business_name text NOT NULL,
    segment text,
    main_channel text,
    frequency text,
    objective text,
    target_audience text,
    generated_content text,
    generated_at timestamp with time zone,
    status text DEFAULT 'draft'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: briefings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.briefings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    created_by_user_id uuid,
    company_name text NOT NULL,
    location text,
    segment text,
    time_in_business text,
    company_size text,
    has_website boolean DEFAULT false,
    social_networks text[],
    main_contact_channel text,
    service_type text,
    main_difficulty text,
    where_loses_clients text,
    main_bottleneck text,
    what_to_improve text,
    main_priority text,
    interests text[],
    maturity_level text,
    main_pains text,
    opportunities text,
    intelligent_summary text,
    converted_to_planning_id uuid,
    converted_at timestamp with time zone,
    status text DEFAULT 'draft'::text NOT NULL,
    origin text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    name text NOT NULL,
    niche text,
    city text,
    whatsapp text,
    instagram text,
    notes text,
    status text DEFAULT 'active'::text,
    last_contact timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    contact_name text,
    contact_email text,
    contact_phone text,
    segment text,
    observations text,
    created_by_user_id uuid
);

ALTER TABLE ONLY public.clients FORCE ROW LEVEL SECURITY;


--
-- Name: contracts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contracts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    client_id uuid NOT NULL,
    proposal_id uuid,
    title text NOT NULL,
    parties_identification text,
    contract_object text,
    service_scope text,
    deadline text,
    value_and_payment text,
    responsibilities text,
    cancellation_terms text,
    jurisdiction text DEFAULT 'Foro da Comarca do contratante'::text,
    status text DEFAULT 'draft'::text NOT NULL,
    sent_at timestamp with time zone,
    created_by_user_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.contracts FORCE ROW LEVEL SECURITY;


--
-- Name: deliveries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deliveries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    client_id uuid NOT NULL,
    proposal_id uuid,
    planning_id uuid,
    project_id uuid,
    title text NOT NULL,
    delivery_type text NOT NULL,
    description text,
    delivery_date date DEFAULT CURRENT_DATE NOT NULL,
    links text,
    observations text,
    next_steps text,
    status text DEFAULT 'delivered'::text NOT NULL,
    created_by_user_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.deliveries FORCE ROW LEVEL SECURITY;


--
-- Name: digital_diagnoses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.digital_diagnoses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    created_by_user_id uuid,
    company_name text NOT NULL,
    segment text,
    city_state text,
    has_website boolean DEFAULT false,
    social_networks text[],
    main_objective text,
    online_presence_rating integer,
    digital_communication_rating integer,
    contact_ease_rating integer,
    professionalism_rating integer,
    main_problem_perceived text,
    diagnosis_text text,
    diagnosis_generated_at timestamp with time zone,
    status text DEFAULT 'draft'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT digital_diagnoses_contact_ease_rating_check CHECK (((contact_ease_rating >= 1) AND (contact_ease_rating <= 5))),
    CONSTRAINT digital_diagnoses_digital_communication_rating_check CHECK (((digital_communication_rating >= 1) AND (digital_communication_rating <= 5))),
    CONSTRAINT digital_diagnoses_online_presence_rating_check CHECK (((online_presence_rating >= 1) AND (online_presence_rating <= 5))),
    CONSTRAINT digital_diagnoses_professionalism_rating_check CHECK (((professionalism_rating >= 1) AND (professionalism_rating <= 5))),
    CONSTRAINT digital_diagnoses_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'completed'::text, 'sent'::text])))
);

ALTER TABLE ONLY public.digital_diagnoses FORCE ROW LEVEL SECURITY;


--
-- Name: digital_positionings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.digital_positionings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    created_by_user_id uuid,
    company_name text NOT NULL,
    segment text,
    city_state text,
    target_audience text,
    main_product_service text,
    business_differential text,
    positioning_objectives text[] DEFAULT '{}'::text[],
    observations text,
    generated_positioning text,
    generated_at timestamp with time zone,
    status text DEFAULT 'draft'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.digital_positionings FORCE ROW LEVEL SECURITY;


--
-- Name: launch_kits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.launch_kits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    created_by_user_id uuid,
    business_name text NOT NULL,
    business_type text,
    segment text,
    location text,
    main_channel text,
    objective text,
    deadline text,
    urgency text,
    generated_content text,
    generated_at timestamp with time zone,
    status text DEFAULT 'draft'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    project_type text,
    target_audience text,
    brand_style text,
    brand_feeling text,
    preferred_colors text,
    visual_notes text,
    logo_url text,
    logo_concept text,
    logo_usage_guidelines text
);


--
-- Name: lead_search_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lead_search_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid,
    payload jsonb DEFAULT '{}'::jsonb NOT NULL,
    step text NOT NULL,
    status integer DEFAULT 200 NOT NULL,
    ms integer DEFAULT 0 NOT NULL,
    error text,
    results_count integer DEFAULT 0 NOT NULL
);

ALTER TABLE ONLY public.lead_search_logs FORCE ROW LEVEL SECURITY;


--
-- Name: metrics_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.metrics_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    date date DEFAULT CURRENT_DATE NOT NULL,
    projects_count integer DEFAULT 0 NOT NULL,
    proposals_count integer DEFAULT 0 NOT NULL,
    clients_count integer DEFAULT 0 NOT NULL,
    deliveries_count integer DEFAULT 0 NOT NULL,
    contracts_count integer DEFAULT 0 NOT NULL,
    pipeline_value numeric DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: nexia_clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nexia_clients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    name text NOT NULL,
    segment text,
    observations text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by_user_id uuid NOT NULL,
    contact_name text,
    contact_email text,
    contact_phone text,
    status text DEFAULT 'active'::text NOT NULL
);

ALTER TABLE ONLY public.nexia_clients FORCE ROW LEVEL SECURITY;


--
-- Name: nexia_plannings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nexia_plannings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    client_id uuid,
    name text NOT NULL,
    primary_goal text,
    focus_area text,
    diagnosis_text text,
    maturity_level text,
    main_bottleneck text,
    priority_goal text,
    strategy_summary text,
    status text DEFAULT 'draft'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by_user_id uuid,
    description text,
    diagnosis_updated_at timestamp with time zone,
    marketing_maturity_level text,
    marketing_current_state text,
    marketing_top_goal text,
    sales_maturity_level text,
    sales_top_goal text,
    include_sales boolean DEFAULT false,
    objectives_list jsonb DEFAULT '[]'::jsonb,
    tasks_generated boolean DEFAULT false,
    conclusion_notes text,
    current_step integer DEFAULT 1,
    company_name text,
    sector_niche text,
    company_size text,
    average_ticket text,
    location_region text,
    main_products_services text,
    target_audience text,
    initial_objective text,
    sales_method text,
    acquisition_channels jsonb DEFAULT '[]'::jsonb,
    has_team text,
    results_measurement text,
    competitive_differential text,
    main_challenges text,
    growth_bottlenecks text,
    growth_blockers text,
    goal_3_months text,
    goal_12_months text,
    urgency_level integer DEFAULT 3,
    marketing_structure_rating integer DEFAULT 3,
    sales_structure_rating integer DEFAULT 3,
    digital_organization_rating integer DEFAULT 3,
    positioning_clarity_rating integer DEFAULT 3,
    mode text DEFAULT 'full'::text,
    solution_type text,
    main_problem text,
    simple_summary text
);

ALTER TABLE ONLY public.nexia_plannings FORCE ROW LEVEL SECURITY;


--
-- Name: nexia_tasks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.nexia_tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    planning_id uuid,
    title text NOT NULL,
    objective text,
    steps text,
    completion_criteria text,
    status text DEFAULT 'pending'::text NOT NULL,
    completed_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    description text,
    focus_area text,
    objective_title text,
    priority text DEFAULT 'medium'::text,
    due_date timestamp with time zone,
    completed_by_user_id uuid,
    client_id uuid,
    created_by_user_id uuid
);

ALTER TABLE ONLY public.nexia_tasks FORCE ROW LEVEL SECURITY;


--
-- Name: process_organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.process_organizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    created_by_user_id uuid,
    business_type text NOT NULL,
    team_size text,
    contact_channels text,
    time_waste_areas text,
    main_internal_problem text,
    organization_goal text,
    operation_overview text,
    process_problems text,
    ideal_flow text,
    internal_organization text,
    recommended_routine text,
    attention_points text,
    status text DEFAULT 'draft'::text NOT NULL,
    generated_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.process_organizations FORCE ROW LEVEL SECURITY;


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    full_name text NOT NULL,
    email text NOT NULL,
    avatar_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.profiles FORCE ROW LEVEL SECURITY;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    template_id text,
    app_name text NOT NULL,
    target_audience text,
    main_task text,
    main_benefit text,
    daily_users text,
    pages text,
    other_features text,
    primary_color text DEFAULT '#2563EB'::text,
    secondary_color text DEFAULT '#1F2937'::text,
    background_color text DEFAULT '#0B0F19'::text,
    text_color text DEFAULT '#E5E7EB'::text,
    font_family text DEFAULT 'Roboto'::text,
    custom_font text,
    language text DEFAULT 'pt-BR'::text,
    target_platform text DEFAULT 'lovable'::text,
    status text DEFAULT 'draft'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    generated_prompt text
);

ALTER TABLE ONLY public.projects FORCE ROW LEVEL SECURITY;


--
-- Name: proposals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.proposals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    client_id uuid,
    planning_id uuid,
    project_id uuid,
    title text NOT NULL,
    service_type text NOT NULL,
    description text,
    deliverables text,
    estimated_deadline text,
    total_value numeric(10,2),
    payment_terms text,
    observations text,
    status text DEFAULT 'draft'::text NOT NULL,
    created_by_user_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    prospect_name text,
    prospect_phone text,
    prospect_email text,
    custom_origin text,
    custom_service_type text
);

ALTER TABLE ONLY public.proposals FORCE ROW LEVEL SECURITY;


--
-- Name: solution_contracts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.solution_contracts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    created_by_user_id uuid,
    proposal_id uuid,
    contractor_name text NOT NULL,
    contractor_document text,
    contractor_address text,
    contracted_name text NOT NULL,
    contracted_document text,
    service_description text,
    service_value numeric(12,2),
    payment_terms text,
    deadline text,
    contract_text text,
    contract_generated_at timestamp with time zone,
    status text DEFAULT 'draft'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    project_id uuid,
    client_name text,
    client_document text,
    platforms text[],
    functionalities text,
    exclusions text,
    delivery_start text,
    include_maintenance boolean DEFAULT false,
    maintenance_value numeric,
    portfolio_rights boolean DEFAULT true,
    transfer_after_payment boolean DEFAULT true,
    termination_penalty boolean DEFAULT false,
    additional_clauses text,
    contractor_city text,
    contractor_type text,
    client_type text,
    CONSTRAINT solution_contracts_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'completed'::text, 'signed'::text])))
);

ALTER TABLE ONLY public.solution_contracts FORCE ROW LEVEL SECURITY;


--
-- Name: solution_proposals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.solution_proposals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workspace_id uuid NOT NULL,
    created_by_user_id uuid,
    company_name text NOT NULL,
    contact_name text,
    service_offered text NOT NULL,
    service_value numeric(12,2),
    deadline text,
    payment_method text,
    scope_items text[],
    observations text,
    proposal_text text,
    proposal_generated_at timestamp with time zone,
    status text DEFAULT 'draft'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT solution_proposals_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'completed'::text, 'sent'::text])))
);

ALTER TABLE ONLY public.solution_proposals FORCE ROW LEVEL SECURITY;


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    plan_name text DEFAULT 'free'::text,
    status text DEFAULT 'active'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.subscriptions FORCE ROW LEVEL SECURITY;


--
-- Name: workspaces; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workspaces (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    operation_name text,
    niche text,
    one_liner text,
    tone text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY public.workspaces FORCE ROW LEVEL SECURITY;


--
-- Name: activity_logs activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_pkey PRIMARY KEY (id);


--
-- Name: authority_strategies authority_strategies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authority_strategies
    ADD CONSTRAINT authority_strategies_pkey PRIMARY KEY (id);


--
-- Name: briefings briefings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.briefings
    ADD CONSTRAINT briefings_pkey PRIMARY KEY (id);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: contracts contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_pkey PRIMARY KEY (id);


--
-- Name: deliveries deliveries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT deliveries_pkey PRIMARY KEY (id);


--
-- Name: digital_diagnoses digital_diagnoses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.digital_diagnoses
    ADD CONSTRAINT digital_diagnoses_pkey PRIMARY KEY (id);


--
-- Name: digital_positionings digital_positionings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.digital_positionings
    ADD CONSTRAINT digital_positionings_pkey PRIMARY KEY (id);


--
-- Name: launch_kits launch_kits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.launch_kits
    ADD CONSTRAINT launch_kits_pkey PRIMARY KEY (id);


--
-- Name: lead_search_logs lead_search_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lead_search_logs
    ADD CONSTRAINT lead_search_logs_pkey PRIMARY KEY (id);


--
-- Name: metrics_history metrics_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.metrics_history
    ADD CONSTRAINT metrics_history_pkey PRIMARY KEY (id);


--
-- Name: metrics_history metrics_history_workspace_id_date_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.metrics_history
    ADD CONSTRAINT metrics_history_workspace_id_date_key UNIQUE (workspace_id, date);


--
-- Name: nexia_clients nexia_clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nexia_clients
    ADD CONSTRAINT nexia_clients_pkey PRIMARY KEY (id);


--
-- Name: nexia_plannings nexia_plannings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nexia_plannings
    ADD CONSTRAINT nexia_plannings_pkey PRIMARY KEY (id);


--
-- Name: nexia_tasks nexia_tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nexia_tasks
    ADD CONSTRAINT nexia_tasks_pkey PRIMARY KEY (id);


--
-- Name: process_organizations process_organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.process_organizations
    ADD CONSTRAINT process_organizations_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: proposals proposals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_pkey PRIMARY KEY (id);


--
-- Name: solution_contracts solution_contracts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solution_contracts
    ADD CONSTRAINT solution_contracts_pkey PRIMARY KEY (id);


--
-- Name: solution_proposals solution_proposals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solution_proposals
    ADD CONSTRAINT solution_proposals_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: workspaces workspaces_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_pkey PRIMARY KEY (id);


--
-- Name: idx_activity_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_created_at ON public.activity_logs USING btree (created_at DESC);


--
-- Name: idx_activity_logs_entity_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_entity_id ON public.activity_logs USING btree (entity_id);


--
-- Name: idx_activity_logs_entity_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_entity_type ON public.activity_logs USING btree (entity_type);


--
-- Name: idx_activity_logs_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_type ON public.activity_logs USING btree (type);


--
-- Name: idx_activity_logs_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_logs_user_id ON public.activity_logs USING btree (user_id);


--
-- Name: idx_clients_segment; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clients_segment ON public.clients USING btree (segment);


--
-- Name: idx_clients_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_clients_status ON public.clients USING btree (status);


--
-- Name: idx_contracts_client; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contracts_client ON public.contracts USING btree (client_id);


--
-- Name: idx_contracts_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contracts_status ON public.contracts USING btree (status);


--
-- Name: idx_contracts_workspace; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_contracts_workspace ON public.contracts USING btree (workspace_id);


--
-- Name: idx_deliveries_client; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_deliveries_client ON public.deliveries USING btree (client_id);


--
-- Name: idx_deliveries_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_deliveries_date ON public.deliveries USING btree (delivery_date);


--
-- Name: idx_deliveries_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_deliveries_status ON public.deliveries USING btree (status);


--
-- Name: idx_deliveries_workspace; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_deliveries_workspace ON public.deliveries USING btree (workspace_id);


--
-- Name: idx_lead_search_logs_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_lead_search_logs_created_at ON public.lead_search_logs USING btree (created_at DESC);


--
-- Name: idx_metrics_history_workspace_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_metrics_history_workspace_date ON public.metrics_history USING btree (workspace_id, date DESC);


--
-- Name: idx_nexia_clients_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nexia_clients_status ON public.nexia_clients USING btree (status);


--
-- Name: idx_nexia_clients_workspace_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nexia_clients_workspace_status ON public.nexia_clients USING btree (workspace_id, status);


--
-- Name: idx_nexia_plannings_client; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nexia_plannings_client ON public.nexia_plannings USING btree (client_id);


--
-- Name: idx_nexia_plannings_mode; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nexia_plannings_mode ON public.nexia_plannings USING btree (mode);


--
-- Name: idx_nexia_plannings_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nexia_plannings_status ON public.nexia_plannings USING btree (status);


--
-- Name: idx_nexia_plannings_workspace_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nexia_plannings_workspace_status ON public.nexia_plannings USING btree (workspace_id, status);


--
-- Name: idx_nexia_tasks_client_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nexia_tasks_client_id ON public.nexia_tasks USING btree (client_id);


--
-- Name: idx_nexia_tasks_planning_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nexia_tasks_planning_id ON public.nexia_tasks USING btree (planning_id);


--
-- Name: idx_nexia_tasks_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nexia_tasks_status ON public.nexia_tasks USING btree (status);


--
-- Name: idx_nexia_tasks_workspace_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_nexia_tasks_workspace_id ON public.nexia_tasks USING btree (workspace_id);


--
-- Name: idx_proposals_client; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_proposals_client ON public.proposals USING btree (client_id);


--
-- Name: idx_proposals_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_proposals_status ON public.proposals USING btree (status);


--
-- Name: idx_proposals_workspace; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_proposals_workspace ON public.proposals USING btree (workspace_id);


--
-- Name: idx_solution_contracts_project_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_solution_contracts_project_id ON public.solution_contracts USING btree (project_id);


--
-- Name: authority_strategies update_authority_strategies_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_authority_strategies_updated_at BEFORE UPDATE ON public.authority_strategies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: briefings update_briefings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_briefings_updated_at BEFORE UPDATE ON public.briefings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: clients update_clients_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: contracts update_contracts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: deliveries update_deliveries_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON public.deliveries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: digital_diagnoses update_digital_diagnoses_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_digital_diagnoses_updated_at BEFORE UPDATE ON public.digital_diagnoses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: digital_positionings update_digital_positionings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_digital_positionings_updated_at BEFORE UPDATE ON public.digital_positionings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: launch_kits update_launch_kits_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_launch_kits_updated_at BEFORE UPDATE ON public.launch_kits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: nexia_clients update_nexia_clients_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_nexia_clients_updated_at BEFORE UPDATE ON public.nexia_clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: nexia_plannings update_nexia_plannings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_nexia_plannings_updated_at BEFORE UPDATE ON public.nexia_plannings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: nexia_tasks update_nexia_tasks_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_nexia_tasks_updated_at BEFORE UPDATE ON public.nexia_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: process_organizations update_process_organizations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_process_organizations_updated_at BEFORE UPDATE ON public.process_organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: projects update_projects_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: proposals update_proposals_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON public.proposals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: solution_contracts update_solution_contracts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_solution_contracts_updated_at BEFORE UPDATE ON public.solution_contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: solution_proposals update_solution_proposals_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_solution_proposals_updated_at BEFORE UPDATE ON public.solution_proposals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subscriptions update_subscriptions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: workspaces update_workspaces_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: activity_logs activity_logs_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_logs
    ADD CONSTRAINT activity_logs_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: authority_strategies authority_strategies_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authority_strategies
    ADD CONSTRAINT authority_strategies_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: briefings briefings_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.briefings
    ADD CONSTRAINT briefings_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: clients clients_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: contracts contracts_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: contracts contracts_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE SET NULL;


--
-- Name: contracts contracts_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contracts
    ADD CONSTRAINT contracts_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: deliveries deliveries_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT deliveries_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: deliveries deliveries_planning_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT deliveries_planning_id_fkey FOREIGN KEY (planning_id) REFERENCES public.nexia_plannings(id) ON DELETE SET NULL;


--
-- Name: deliveries deliveries_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT deliveries_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: deliveries deliveries_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT deliveries_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.proposals(id) ON DELETE SET NULL;


--
-- Name: deliveries deliveries_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deliveries
    ADD CONSTRAINT deliveries_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: digital_diagnoses digital_diagnoses_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.digital_diagnoses
    ADD CONSTRAINT digital_diagnoses_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES auth.users(id);


--
-- Name: digital_diagnoses digital_diagnoses_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.digital_diagnoses
    ADD CONSTRAINT digital_diagnoses_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: digital_positionings digital_positionings_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.digital_positionings
    ADD CONSTRAINT digital_positionings_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: launch_kits launch_kits_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.launch_kits
    ADD CONSTRAINT launch_kits_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: metrics_history metrics_history_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.metrics_history
    ADD CONSTRAINT metrics_history_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: nexia_clients nexia_clients_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nexia_clients
    ADD CONSTRAINT nexia_clients_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES auth.users(id);


--
-- Name: nexia_clients nexia_clients_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nexia_clients
    ADD CONSTRAINT nexia_clients_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: nexia_plannings nexia_plannings_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nexia_plannings
    ADD CONSTRAINT nexia_plannings_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: nexia_plannings nexia_plannings_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nexia_plannings
    ADD CONSTRAINT nexia_plannings_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES auth.users(id);


--
-- Name: nexia_plannings nexia_plannings_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nexia_plannings
    ADD CONSTRAINT nexia_plannings_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: nexia_tasks nexia_tasks_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nexia_tasks
    ADD CONSTRAINT nexia_tasks_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: nexia_tasks nexia_tasks_planning_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nexia_tasks
    ADD CONSTRAINT nexia_tasks_planning_id_fkey FOREIGN KEY (planning_id) REFERENCES public.nexia_plannings(id) ON DELETE CASCADE;


--
-- Name: nexia_tasks nexia_tasks_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.nexia_tasks
    ADD CONSTRAINT nexia_tasks_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: process_organizations process_organizations_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.process_organizations
    ADD CONSTRAINT process_organizations_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES auth.users(id);


--
-- Name: process_organizations process_organizations_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.process_organizations
    ADD CONSTRAINT process_organizations_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: projects projects_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: proposals proposals_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: proposals proposals_planning_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_planning_id_fkey FOREIGN KEY (planning_id) REFERENCES public.nexia_plannings(id) ON DELETE SET NULL;


--
-- Name: proposals proposals_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: proposals proposals_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.proposals
    ADD CONSTRAINT proposals_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: solution_contracts solution_contracts_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solution_contracts
    ADD CONSTRAINT solution_contracts_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES auth.users(id);


--
-- Name: solution_contracts solution_contracts_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solution_contracts
    ADD CONSTRAINT solution_contracts_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE SET NULL;


--
-- Name: solution_contracts solution_contracts_proposal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solution_contracts
    ADD CONSTRAINT solution_contracts_proposal_id_fkey FOREIGN KEY (proposal_id) REFERENCES public.solution_proposals(id);


--
-- Name: solution_contracts solution_contracts_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solution_contracts
    ADD CONSTRAINT solution_contracts_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: solution_proposals solution_proposals_created_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solution_proposals
    ADD CONSTRAINT solution_proposals_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES auth.users(id);


--
-- Name: solution_proposals solution_proposals_workspace_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.solution_proposals
    ADD CONSTRAINT solution_proposals_workspace_id_fkey FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id) ON DELETE CASCADE;


--
-- Name: subscriptions subscriptions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: workspaces workspaces_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workspaces
    ADD CONSTRAINT workspaces_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: lead_search_logs Allow insert from edge functions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow insert from edge functions" ON public.lead_search_logs FOR INSERT WITH CHECK (true);


--
-- Name: authority_strategies Users can create authority_strategies in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create authority_strategies in their workspace" ON public.authority_strategies FOR INSERT WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: briefings Users can create briefings in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create briefings in their workspace" ON public.briefings FOR INSERT WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: clients Users can create clients in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create clients in their workspace" ON public.clients FOR INSERT TO authenticated WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: nexia_clients Users can create clients in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create clients in their workspace" ON public.nexia_clients FOR INSERT TO authenticated WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: contracts Users can create contracts in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create contracts in their workspace" ON public.contracts FOR INSERT TO authenticated WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: deliveries Users can create deliveries in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create deliveries in their workspace" ON public.deliveries FOR INSERT TO authenticated WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: digital_diagnoses Users can create diagnoses in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create diagnoses in their workspace" ON public.digital_diagnoses FOR INSERT TO authenticated WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: launch_kits Users can create launch_kits in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create launch_kits in their workspace" ON public.launch_kits FOR INSERT WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: activity_logs Users can create logs in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create logs in their workspace" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: nexia_plannings Users can create plannings in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create plannings in their workspace" ON public.nexia_plannings FOR INSERT TO authenticated WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: digital_positionings Users can create positionings in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create positionings in their workspace" ON public.digital_positionings FOR INSERT TO authenticated WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: process_organizations Users can create process_organizations in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create process_organizations in their workspace" ON public.process_organizations FOR INSERT TO authenticated WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: projects Users can create projects in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create projects in their workspace" ON public.projects FOR INSERT TO authenticated WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: proposals Users can create proposals in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create proposals in their workspace" ON public.proposals FOR INSERT TO authenticated WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: solution_contracts Users can create solution_contracts in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create solution_contracts in their workspace" ON public.solution_contracts FOR INSERT TO authenticated WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: solution_proposals Users can create solution_proposals in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create solution_proposals in their workspace" ON public.solution_proposals FOR INSERT TO authenticated WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: nexia_tasks Users can create tasks in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create tasks in their workspace" ON public.nexia_tasks FOR INSERT TO authenticated WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: metrics_history Users can create their own metrics history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own metrics history" ON public.metrics_history FOR INSERT WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: subscriptions Users can create their own subscription; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own subscription" ON public.subscriptions FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: workspaces Users can create their own workspaces; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create their own workspaces" ON public.workspaces FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: authority_strategies Users can delete authority_strategies in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete authority_strategies in their workspace" ON public.authority_strategies FOR DELETE USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: briefings Users can delete briefings in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete briefings in their workspace" ON public.briefings FOR DELETE USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: clients Users can delete clients in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete clients in their workspace" ON public.clients FOR DELETE TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: contracts Users can delete contracts in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete contracts in their workspace" ON public.contracts FOR DELETE TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: deliveries Users can delete deliveries in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete deliveries in their workspace" ON public.deliveries FOR DELETE TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: digital_diagnoses Users can delete diagnoses in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete diagnoses in their workspace" ON public.digital_diagnoses FOR DELETE TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: launch_kits Users can delete launch_kits in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete launch_kits in their workspace" ON public.launch_kits FOR DELETE USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: digital_positionings Users can delete positionings in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete positionings in their workspace" ON public.digital_positionings FOR DELETE TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: process_organizations Users can delete process_organizations in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete process_organizations in their workspace" ON public.process_organizations FOR DELETE TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: projects Users can delete projects in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete projects in their workspace" ON public.projects FOR DELETE TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: proposals Users can delete proposals in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete proposals in their workspace" ON public.proposals FOR DELETE TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: solution_contracts Users can delete solution_contracts in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete solution_contracts in their workspace" ON public.solution_contracts FOR DELETE TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: solution_proposals Users can delete solution_proposals in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete solution_proposals in their workspace" ON public.solution_proposals FOR DELETE TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: workspaces Users can delete their own workspaces; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their own workspaces" ON public.workspaces FOR DELETE USING ((auth.uid() = user_id));


--
-- Name: nexia_clients Users can delete their workspace clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their workspace clients" ON public.nexia_clients FOR DELETE TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: nexia_plannings Users can delete their workspace plannings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their workspace plannings" ON public.nexia_plannings FOR DELETE TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: nexia_tasks Users can delete their workspace tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their workspace tasks" ON public.nexia_tasks FOR DELETE TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: profiles Users can insert their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK ((auth.uid() = id));


--
-- Name: authority_strategies Users can update authority_strategies in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update authority_strategies in their workspace" ON public.authority_strategies FOR UPDATE USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid())))) WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: briefings Users can update briefings in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update briefings in their workspace" ON public.briefings FOR UPDATE USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid())))) WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: clients Users can update clients in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update clients in their workspace" ON public.clients FOR UPDATE TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid())))) WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: contracts Users can update contracts in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update contracts in their workspace" ON public.contracts FOR UPDATE TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid())))) WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: deliveries Users can update deliveries in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update deliveries in their workspace" ON public.deliveries FOR UPDATE TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid())))) WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: digital_diagnoses Users can update diagnoses in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update diagnoses in their workspace" ON public.digital_diagnoses FOR UPDATE TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid())))) WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: launch_kits Users can update launch_kits in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update launch_kits in their workspace" ON public.launch_kits FOR UPDATE USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid())))) WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: digital_positionings Users can update positionings in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update positionings in their workspace" ON public.digital_positionings FOR UPDATE TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid())))) WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: process_organizations Users can update process_organizations in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update process_organizations in their workspace" ON public.process_organizations FOR UPDATE TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid())))) WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: projects Users can update projects in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update projects in their workspace" ON public.projects FOR UPDATE TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid())))) WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: proposals Users can update proposals in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update proposals in their workspace" ON public.proposals FOR UPDATE TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid())))) WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: solution_contracts Users can update solution_contracts in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update solution_contracts in their workspace" ON public.solution_contracts FOR UPDATE TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid())))) WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: solution_proposals Users can update solution_proposals in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update solution_proposals in their workspace" ON public.solution_proposals FOR UPDATE TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid())))) WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: metrics_history Users can update their own metrics history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own metrics history" ON public.metrics_history FOR UPDATE USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid())))) WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));


--
-- Name: subscriptions Users can update their own subscription; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own subscription" ON public.subscriptions FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: workspaces Users can update their own workspaces; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own workspaces" ON public.workspaces FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: nexia_clients Users can update their workspace clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their workspace clients" ON public.nexia_clients FOR UPDATE TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid())))) WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: nexia_plannings Users can update their workspace plannings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their workspace plannings" ON public.nexia_plannings FOR UPDATE TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid())))) WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: nexia_tasks Users can update their workspace tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their workspace tasks" ON public.nexia_tasks FOR UPDATE TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid())))) WITH CHECK ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: authority_strategies Users can view authority_strategies in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view authority_strategies in their workspace" ON public.authority_strategies FOR SELECT USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: briefings Users can view briefings in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view briefings in their workspace" ON public.briefings FOR SELECT USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: clients Users can view clients in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view clients in their workspace" ON public.clients FOR SELECT TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: contracts Users can view contracts in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view contracts in their workspace" ON public.contracts FOR SELECT TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: deliveries Users can view deliveries in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view deliveries in their workspace" ON public.deliveries FOR SELECT TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: digital_diagnoses Users can view diagnoses in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view diagnoses in their workspace" ON public.digital_diagnoses FOR SELECT TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: launch_kits Users can view launch_kits in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view launch_kits in their workspace" ON public.launch_kits FOR SELECT USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: activity_logs Users can view logs in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view logs in their workspace" ON public.activity_logs FOR SELECT TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: digital_positionings Users can view positionings in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view positionings in their workspace" ON public.digital_positionings FOR SELECT TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: process_organizations Users can view process_organizations in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view process_organizations in their workspace" ON public.process_organizations FOR SELECT TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: projects Users can view projects in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view projects in their workspace" ON public.projects FOR SELECT TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: proposals Users can view proposals in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view proposals in their workspace" ON public.proposals FOR SELECT TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: solution_contracts Users can view solution_contracts in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view solution_contracts in their workspace" ON public.solution_contracts FOR SELECT TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: solution_proposals Users can view solution_proposals in their workspace; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view solution_proposals in their workspace" ON public.solution_proposals FOR SELECT TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: metrics_history Users can view their own metrics history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own metrics history" ON public.metrics_history FOR SELECT USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: profiles Users can view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING ((auth.uid() = id));


--
-- Name: lead_search_logs Users can view their own search logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own search logs" ON public.lead_search_logs FOR SELECT TO authenticated USING ((auth.uid() = user_id));


--
-- Name: subscriptions Users can view their own subscription; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own subscription" ON public.subscriptions FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: workspaces Users can view their own workspaces; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own workspaces" ON public.workspaces FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: nexia_clients Users can view their workspace clients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their workspace clients" ON public.nexia_clients FOR SELECT TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: nexia_plannings Users can view their workspace plannings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their workspace plannings" ON public.nexia_plannings FOR SELECT TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: nexia_tasks Users can view their workspace tasks; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their workspace tasks" ON public.nexia_tasks FOR SELECT TO authenticated USING ((workspace_id IN ( SELECT workspaces.id
   FROM public.workspaces
  WHERE (workspaces.user_id = auth.uid()))));


--
-- Name: activity_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: authority_strategies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.authority_strategies ENABLE ROW LEVEL SECURITY;

--
-- Name: briefings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.briefings ENABLE ROW LEVEL SECURITY;

--
-- Name: clients; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

--
-- Name: contracts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

--
-- Name: deliveries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;

--
-- Name: digital_diagnoses; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.digital_diagnoses ENABLE ROW LEVEL SECURITY;

--
-- Name: digital_positionings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.digital_positionings ENABLE ROW LEVEL SECURITY;

--
-- Name: launch_kits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.launch_kits ENABLE ROW LEVEL SECURITY;

--
-- Name: lead_search_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.lead_search_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: metrics_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.metrics_history ENABLE ROW LEVEL SECURITY;

--
-- Name: nexia_clients; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.nexia_clients ENABLE ROW LEVEL SECURITY;

--
-- Name: nexia_plannings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.nexia_plannings ENABLE ROW LEVEL SECURITY;

--
-- Name: nexia_tasks; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.nexia_tasks ENABLE ROW LEVEL SECURITY;

--
-- Name: process_organizations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.process_organizations ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: projects; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

--
-- Name: proposals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

--
-- Name: solution_contracts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.solution_contracts ENABLE ROW LEVEL SECURITY;

--
-- Name: solution_proposals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.solution_proposals ENABLE ROW LEVEL SECURITY;

--
-- Name: subscriptions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

--
-- Name: workspaces; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;