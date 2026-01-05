export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          created_at: string
          description: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          message: string
          metadata: Json | null
          title: string | null
          type: string
          user_id: string | null
          workspace_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message: string
          metadata?: Json | null
          title?: string | null
          type: string
          user_id?: string | null
          workspace_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          title?: string | null
          type?: string
          user_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      authority_strategies: {
        Row: {
          business_name: string
          created_at: string
          created_by_user_id: string | null
          frequency: string | null
          generated_at: string | null
          generated_content: string | null
          id: string
          main_channel: string | null
          objective: string | null
          segment: string | null
          status: string
          target_audience: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          business_name: string
          created_at?: string
          created_by_user_id?: string | null
          frequency?: string | null
          generated_at?: string | null
          generated_content?: string | null
          id?: string
          main_channel?: string | null
          objective?: string | null
          segment?: string | null
          status?: string
          target_audience?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          business_name?: string
          created_at?: string
          created_by_user_id?: string | null
          frequency?: string | null
          generated_at?: string | null
          generated_content?: string | null
          id?: string
          main_channel?: string | null
          objective?: string | null
          segment?: string | null
          status?: string
          target_audience?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "authority_strategies_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      briefings: {
        Row: {
          company_name: string
          company_size: string | null
          converted_at: string | null
          converted_to_planning_id: string | null
          created_at: string
          created_by_user_id: string | null
          has_website: boolean | null
          id: string
          intelligent_summary: string | null
          interests: string[] | null
          location: string | null
          main_bottleneck: string | null
          main_contact_channel: string | null
          main_difficulty: string | null
          main_pains: string | null
          main_priority: string | null
          maturity_level: string | null
          opportunities: string | null
          origin: string | null
          segment: string | null
          service_type: string | null
          social_networks: string[] | null
          status: string
          time_in_business: string | null
          updated_at: string
          what_to_improve: string | null
          where_loses_clients: string | null
          workspace_id: string
        }
        Insert: {
          company_name: string
          company_size?: string | null
          converted_at?: string | null
          converted_to_planning_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          has_website?: boolean | null
          id?: string
          intelligent_summary?: string | null
          interests?: string[] | null
          location?: string | null
          main_bottleneck?: string | null
          main_contact_channel?: string | null
          main_difficulty?: string | null
          main_pains?: string | null
          main_priority?: string | null
          maturity_level?: string | null
          opportunities?: string | null
          origin?: string | null
          segment?: string | null
          service_type?: string | null
          social_networks?: string[] | null
          status?: string
          time_in_business?: string | null
          updated_at?: string
          what_to_improve?: string | null
          where_loses_clients?: string | null
          workspace_id: string
        }
        Update: {
          company_name?: string
          company_size?: string | null
          converted_at?: string | null
          converted_to_planning_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          has_website?: boolean | null
          id?: string
          intelligent_summary?: string | null
          interests?: string[] | null
          location?: string | null
          main_bottleneck?: string | null
          main_contact_channel?: string | null
          main_difficulty?: string | null
          main_pains?: string | null
          main_priority?: string | null
          maturity_level?: string | null
          opportunities?: string | null
          origin?: string | null
          segment?: string | null
          service_type?: string | null
          social_networks?: string[] | null
          status?: string
          time_in_business?: string | null
          updated_at?: string
          what_to_improve?: string | null
          where_loses_clients?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "briefings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          city: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          created_by_user_id: string | null
          id: string
          instagram: string | null
          last_contact: string | null
          name: string
          niche: string | null
          notes: string | null
          observations: string | null
          segment: string | null
          status: string | null
          updated_at: string
          whatsapp: string | null
          workspace_id: string
        }
        Insert: {
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          instagram?: string | null
          last_contact?: string | null
          name: string
          niche?: string | null
          notes?: string | null
          observations?: string | null
          segment?: string | null
          status?: string | null
          updated_at?: string
          whatsapp?: string | null
          workspace_id: string
        }
        Update: {
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by_user_id?: string | null
          id?: string
          instagram?: string | null
          last_contact?: string | null
          name?: string
          niche?: string | null
          notes?: string | null
          observations?: string | null
          segment?: string | null
          status?: string | null
          updated_at?: string
          whatsapp?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          cancellation_terms: string | null
          client_id: string
          contract_object: string | null
          created_at: string
          created_by_user_id: string | null
          deadline: string | null
          id: string
          jurisdiction: string | null
          parties_identification: string | null
          proposal_id: string | null
          responsibilities: string | null
          sent_at: string | null
          service_scope: string | null
          status: string
          title: string
          updated_at: string
          value_and_payment: string | null
          workspace_id: string
        }
        Insert: {
          cancellation_terms?: string | null
          client_id: string
          contract_object?: string | null
          created_at?: string
          created_by_user_id?: string | null
          deadline?: string | null
          id?: string
          jurisdiction?: string | null
          parties_identification?: string | null
          proposal_id?: string | null
          responsibilities?: string | null
          sent_at?: string | null
          service_scope?: string | null
          status?: string
          title: string
          updated_at?: string
          value_and_payment?: string | null
          workspace_id: string
        }
        Update: {
          cancellation_terms?: string | null
          client_id?: string
          contract_object?: string | null
          created_at?: string
          created_by_user_id?: string | null
          deadline?: string | null
          id?: string
          jurisdiction?: string | null
          parties_identification?: string | null
          proposal_id?: string | null
          responsibilities?: string | null
          sent_at?: string | null
          service_scope?: string | null
          status?: string
          title?: string
          updated_at?: string
          value_and_payment?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      deliveries: {
        Row: {
          client_id: string
          created_at: string
          created_by_user_id: string | null
          delivery_date: string
          delivery_type: string
          description: string | null
          id: string
          links: string | null
          next_steps: string | null
          observations: string | null
          planning_id: string | null
          project_id: string | null
          proposal_id: string | null
          status: string
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          created_by_user_id?: string | null
          delivery_date?: string
          delivery_type: string
          description?: string | null
          id?: string
          links?: string | null
          next_steps?: string | null
          observations?: string | null
          planning_id?: string | null
          project_id?: string | null
          proposal_id?: string | null
          status?: string
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          created_by_user_id?: string | null
          delivery_date?: string
          delivery_type?: string
          description?: string | null
          id?: string
          links?: string | null
          next_steps?: string | null
          observations?: string | null
          planning_id?: string | null
          project_id?: string | null
          proposal_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_planning_id_fkey"
            columns: ["planning_id"]
            isOneToOne: false
            referencedRelation: "nexia_plannings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_diagnoses: {
        Row: {
          city_state: string | null
          company_name: string
          contact_ease_rating: number | null
          created_at: string
          created_by_user_id: string | null
          diagnosis_generated_at: string | null
          diagnosis_text: string | null
          digital_communication_rating: number | null
          has_website: boolean | null
          id: string
          main_objective: string | null
          main_problem_perceived: string | null
          online_presence_rating: number | null
          professionalism_rating: number | null
          segment: string | null
          social_networks: string[] | null
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          city_state?: string | null
          company_name: string
          contact_ease_rating?: number | null
          created_at?: string
          created_by_user_id?: string | null
          diagnosis_generated_at?: string | null
          diagnosis_text?: string | null
          digital_communication_rating?: number | null
          has_website?: boolean | null
          id?: string
          main_objective?: string | null
          main_problem_perceived?: string | null
          online_presence_rating?: number | null
          professionalism_rating?: number | null
          segment?: string | null
          social_networks?: string[] | null
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          city_state?: string | null
          company_name?: string
          contact_ease_rating?: number | null
          created_at?: string
          created_by_user_id?: string | null
          diagnosis_generated_at?: string | null
          diagnosis_text?: string | null
          digital_communication_rating?: number | null
          has_website?: boolean | null
          id?: string
          main_objective?: string | null
          main_problem_perceived?: string | null
          online_presence_rating?: number | null
          professionalism_rating?: number | null
          segment?: string | null
          social_networks?: string[] | null
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "digital_diagnoses_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_positionings: {
        Row: {
          business_differential: string | null
          city_state: string | null
          company_name: string
          created_at: string
          created_by_user_id: string | null
          generated_at: string | null
          generated_positioning: string | null
          id: string
          main_product_service: string | null
          observations: string | null
          positioning_objectives: string[] | null
          segment: string | null
          status: string
          target_audience: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          business_differential?: string | null
          city_state?: string | null
          company_name: string
          created_at?: string
          created_by_user_id?: string | null
          generated_at?: string | null
          generated_positioning?: string | null
          id?: string
          main_product_service?: string | null
          observations?: string | null
          positioning_objectives?: string[] | null
          segment?: string | null
          status?: string
          target_audience?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          business_differential?: string | null
          city_state?: string | null
          company_name?: string
          created_at?: string
          created_by_user_id?: string | null
          generated_at?: string | null
          generated_positioning?: string | null
          id?: string
          main_product_service?: string | null
          observations?: string | null
          positioning_objectives?: string[] | null
          segment?: string | null
          status?: string
          target_audience?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "digital_positionings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      launch_kits: {
        Row: {
          brand_feeling: string | null
          brand_style: string | null
          business_name: string
          business_type: string | null
          created_at: string
          created_by_user_id: string | null
          deadline: string | null
          generated_at: string | null
          generated_content: string | null
          id: string
          location: string | null
          logo_concept: string | null
          logo_url: string | null
          logo_usage_guidelines: string | null
          main_channel: string | null
          objective: string | null
          preferred_colors: string | null
          project_type: string | null
          segment: string | null
          status: string
          target_audience: string | null
          updated_at: string
          urgency: string | null
          visual_notes: string | null
          workspace_id: string
        }
        Insert: {
          brand_feeling?: string | null
          brand_style?: string | null
          business_name: string
          business_type?: string | null
          created_at?: string
          created_by_user_id?: string | null
          deadline?: string | null
          generated_at?: string | null
          generated_content?: string | null
          id?: string
          location?: string | null
          logo_concept?: string | null
          logo_url?: string | null
          logo_usage_guidelines?: string | null
          main_channel?: string | null
          objective?: string | null
          preferred_colors?: string | null
          project_type?: string | null
          segment?: string | null
          status?: string
          target_audience?: string | null
          updated_at?: string
          urgency?: string | null
          visual_notes?: string | null
          workspace_id: string
        }
        Update: {
          brand_feeling?: string | null
          brand_style?: string | null
          business_name?: string
          business_type?: string | null
          created_at?: string
          created_by_user_id?: string | null
          deadline?: string | null
          generated_at?: string | null
          generated_content?: string | null
          id?: string
          location?: string | null
          logo_concept?: string | null
          logo_url?: string | null
          logo_usage_guidelines?: string | null
          main_channel?: string | null
          objective?: string | null
          preferred_colors?: string | null
          project_type?: string | null
          segment?: string | null
          status?: string
          target_audience?: string | null
          updated_at?: string
          urgency?: string | null
          visual_notes?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "launch_kits_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_search_logs: {
        Row: {
          created_at: string
          error: string | null
          id: string
          ms: number
          payload: Json
          results_count: number
          status: number
          step: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          ms?: number
          payload?: Json
          results_count?: number
          status?: number
          step: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          ms?: number
          payload?: Json
          results_count?: number
          status?: number
          step?: string
          user_id?: string | null
        }
        Relationships: []
      }
      lovable_credit_requests: {
        Row: {
          admin_message: string | null
          admin_note: string | null
          created_at: string
          id: string
          invite_link: string
          resolved_at: string | null
          status: string
          updated_at: string
          user_email: string
          user_id: string
          user_note: string | null
          workspace_id: string
        }
        Insert: {
          admin_message?: string | null
          admin_note?: string | null
          created_at?: string
          id?: string
          invite_link: string
          resolved_at?: string | null
          status?: string
          updated_at?: string
          user_email: string
          user_id: string
          user_note?: string | null
          workspace_id: string
        }
        Update: {
          admin_message?: string | null
          admin_note?: string | null
          created_at?: string
          id?: string
          invite_link?: string
          resolved_at?: string | null
          status?: string
          updated_at?: string
          user_email?: string
          user_id?: string
          user_note?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lovable_credit_requests_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics_history: {
        Row: {
          clients_count: number
          contracts_count: number
          created_at: string
          date: string
          deliveries_count: number
          id: string
          pipeline_value: number
          projects_count: number
          proposals_count: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          clients_count?: number
          contracts_count?: number
          created_at?: string
          date?: string
          deliveries_count?: number
          id?: string
          pipeline_value?: number
          projects_count?: number
          proposals_count?: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          clients_count?: number
          contracts_count?: number
          created_at?: string
          date?: string
          deliveries_count?: number
          id?: string
          pipeline_value?: number
          projects_count?: number
          proposals_count?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "metrics_history_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      nexia_clients: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          created_by_user_id: string
          id: string
          name: string
          observations: string | null
          segment: string | null
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by_user_id: string
          id?: string
          name: string
          observations?: string | null
          segment?: string | null
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by_user_id?: string
          id?: string
          name?: string
          observations?: string | null
          segment?: string | null
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nexia_clients_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      nexia_plannings: {
        Row: {
          acquisition_channels: Json | null
          average_ticket: string | null
          client_id: string | null
          company_name: string | null
          company_size: string | null
          competitive_differential: string | null
          conclusion_notes: string | null
          created_at: string
          created_by_user_id: string | null
          current_step: number | null
          description: string | null
          diagnosis_text: string | null
          diagnosis_updated_at: string | null
          digital_organization_rating: number | null
          focus_area: string | null
          goal_12_months: string | null
          goal_3_months: string | null
          growth_blockers: string | null
          growth_bottlenecks: string | null
          has_team: string | null
          id: string
          include_sales: boolean | null
          initial_objective: string | null
          location_region: string | null
          main_bottleneck: string | null
          main_challenges: string | null
          main_problem: string | null
          main_products_services: string | null
          marketing_current_state: string | null
          marketing_maturity_level: string | null
          marketing_structure_rating: number | null
          marketing_top_goal: string | null
          maturity_level: string | null
          mode: string | null
          name: string
          objectives_list: Json | null
          positioning_clarity_rating: number | null
          primary_goal: string | null
          priority_goal: string | null
          results_measurement: string | null
          sales_maturity_level: string | null
          sales_method: string | null
          sales_structure_rating: number | null
          sales_top_goal: string | null
          sector_niche: string | null
          simple_summary: string | null
          solution_type: string | null
          status: string
          strategy_summary: string | null
          target_audience: string | null
          tasks_generated: boolean | null
          updated_at: string
          urgency_level: number | null
          workspace_id: string
        }
        Insert: {
          acquisition_channels?: Json | null
          average_ticket?: string | null
          client_id?: string | null
          company_name?: string | null
          company_size?: string | null
          competitive_differential?: string | null
          conclusion_notes?: string | null
          created_at?: string
          created_by_user_id?: string | null
          current_step?: number | null
          description?: string | null
          diagnosis_text?: string | null
          diagnosis_updated_at?: string | null
          digital_organization_rating?: number | null
          focus_area?: string | null
          goal_12_months?: string | null
          goal_3_months?: string | null
          growth_blockers?: string | null
          growth_bottlenecks?: string | null
          has_team?: string | null
          id?: string
          include_sales?: boolean | null
          initial_objective?: string | null
          location_region?: string | null
          main_bottleneck?: string | null
          main_challenges?: string | null
          main_problem?: string | null
          main_products_services?: string | null
          marketing_current_state?: string | null
          marketing_maturity_level?: string | null
          marketing_structure_rating?: number | null
          marketing_top_goal?: string | null
          maturity_level?: string | null
          mode?: string | null
          name: string
          objectives_list?: Json | null
          positioning_clarity_rating?: number | null
          primary_goal?: string | null
          priority_goal?: string | null
          results_measurement?: string | null
          sales_maturity_level?: string | null
          sales_method?: string | null
          sales_structure_rating?: number | null
          sales_top_goal?: string | null
          sector_niche?: string | null
          simple_summary?: string | null
          solution_type?: string | null
          status?: string
          strategy_summary?: string | null
          target_audience?: string | null
          tasks_generated?: boolean | null
          updated_at?: string
          urgency_level?: number | null
          workspace_id: string
        }
        Update: {
          acquisition_channels?: Json | null
          average_ticket?: string | null
          client_id?: string | null
          company_name?: string | null
          company_size?: string | null
          competitive_differential?: string | null
          conclusion_notes?: string | null
          created_at?: string
          created_by_user_id?: string | null
          current_step?: number | null
          description?: string | null
          diagnosis_text?: string | null
          diagnosis_updated_at?: string | null
          digital_organization_rating?: number | null
          focus_area?: string | null
          goal_12_months?: string | null
          goal_3_months?: string | null
          growth_blockers?: string | null
          growth_bottlenecks?: string | null
          has_team?: string | null
          id?: string
          include_sales?: boolean | null
          initial_objective?: string | null
          location_region?: string | null
          main_bottleneck?: string | null
          main_challenges?: string | null
          main_problem?: string | null
          main_products_services?: string | null
          marketing_current_state?: string | null
          marketing_maturity_level?: string | null
          marketing_structure_rating?: number | null
          marketing_top_goal?: string | null
          maturity_level?: string | null
          mode?: string | null
          name?: string
          objectives_list?: Json | null
          positioning_clarity_rating?: number | null
          primary_goal?: string | null
          priority_goal?: string | null
          results_measurement?: string | null
          sales_maturity_level?: string | null
          sales_method?: string | null
          sales_structure_rating?: number | null
          sales_top_goal?: string | null
          sector_niche?: string | null
          simple_summary?: string | null
          solution_type?: string | null
          status?: string
          strategy_summary?: string | null
          target_audience?: string | null
          tasks_generated?: boolean | null
          updated_at?: string
          urgency_level?: number | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nexia_plannings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nexia_plannings_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      nexia_tasks: {
        Row: {
          client_id: string | null
          completed_at: string | null
          completed_by_user_id: string | null
          completion_criteria: string | null
          created_at: string
          created_by_user_id: string | null
          description: string | null
          due_date: string | null
          focus_area: string | null
          id: string
          objective: string | null
          objective_title: string | null
          planning_id: string | null
          priority: string | null
          status: string
          steps: string | null
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          client_id?: string | null
          completed_at?: string | null
          completed_by_user_id?: string | null
          completion_criteria?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          due_date?: string | null
          focus_area?: string | null
          id?: string
          objective?: string | null
          objective_title?: string | null
          planning_id?: string | null
          priority?: string | null
          status?: string
          steps?: string | null
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          client_id?: string | null
          completed_at?: string | null
          completed_by_user_id?: string | null
          completion_criteria?: string | null
          created_at?: string
          created_by_user_id?: string | null
          description?: string | null
          due_date?: string | null
          focus_area?: string | null
          id?: string
          objective?: string | null
          objective_title?: string | null
          planning_id?: string | null
          priority?: string | null
          status?: string
          steps?: string | null
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nexia_tasks_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nexia_tasks_planning_id_fkey"
            columns: ["planning_id"]
            isOneToOne: false
            referencedRelation: "nexia_plannings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nexia_tasks_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      owner_metrics: {
        Row: {
          clients: number
          completed_cycles: number
          completed_tasks: number
          contracts: number
          created_at: string
          deliveries: number
          id: string
          pending_tasks: number
          plannings: number
          projects: number
          proposals: number
          reference_date: string
          total_pipeline_value: number
          updated_at: string
          workspace_id: string
        }
        Insert: {
          clients?: number
          completed_cycles?: number
          completed_tasks?: number
          contracts?: number
          created_at?: string
          deliveries?: number
          id?: string
          pending_tasks?: number
          plannings?: number
          projects?: number
          proposals?: number
          reference_date?: string
          total_pipeline_value?: number
          updated_at?: string
          workspace_id: string
        }
        Update: {
          clients?: number
          completed_cycles?: number
          completed_tasks?: number
          contracts?: number
          created_at?: string
          deliveries?: number
          id?: string
          pending_tasks?: number
          plannings?: number
          projects?: number
          proposals?: number
          reference_date?: string
          total_pipeline_value?: number
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_metrics_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      process_organizations: {
        Row: {
          attention_points: string | null
          business_type: string
          contact_channels: string | null
          created_at: string
          created_by_user_id: string | null
          generated_at: string | null
          id: string
          ideal_flow: string | null
          internal_organization: string | null
          main_internal_problem: string | null
          operation_overview: string | null
          organization_goal: string | null
          process_problems: string | null
          recommended_routine: string | null
          status: string
          team_size: string | null
          time_waste_areas: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          attention_points?: string | null
          business_type: string
          contact_channels?: string | null
          created_at?: string
          created_by_user_id?: string | null
          generated_at?: string | null
          id?: string
          ideal_flow?: string | null
          internal_organization?: string | null
          main_internal_problem?: string | null
          operation_overview?: string | null
          organization_goal?: string | null
          process_problems?: string | null
          recommended_routine?: string | null
          status?: string
          team_size?: string | null
          time_waste_areas?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          attention_points?: string | null
          business_type?: string
          contact_channels?: string | null
          created_at?: string
          created_by_user_id?: string | null
          generated_at?: string | null
          id?: string
          ideal_flow?: string | null
          internal_organization?: string | null
          main_internal_problem?: string | null
          operation_overview?: string | null
          organization_goal?: string | null
          process_problems?: string | null
          recommended_routine?: string | null
          status?: string
          team_size?: string | null
          time_waste_areas?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "process_organizations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          access_reason: string | null
          access_status: string
          access_updated_at: string | null
          avatar_url: string | null
          created_at: string
          device_id: string | null
          email: string
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          access_reason?: string | null
          access_status?: string
          access_updated_at?: string | null
          avatar_url?: string | null
          created_at?: string
          device_id?: string | null
          email: string
          full_name: string
          id: string
          updated_at?: string
        }
        Update: {
          access_reason?: string | null
          access_status?: string
          access_updated_at?: string | null
          avatar_url?: string | null
          created_at?: string
          device_id?: string | null
          email?: string
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          app_name: string
          background_color: string | null
          created_at: string
          custom_font: string | null
          daily_users: string | null
          font_family: string | null
          generated_prompt: string | null
          id: string
          language: string | null
          main_benefit: string | null
          main_task: string | null
          other_features: string | null
          pages: string | null
          primary_color: string | null
          secondary_color: string | null
          status: string | null
          target_audience: string | null
          target_platform: string | null
          template_id: string | null
          text_color: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          app_name: string
          background_color?: string | null
          created_at?: string
          custom_font?: string | null
          daily_users?: string | null
          font_family?: string | null
          generated_prompt?: string | null
          id?: string
          language?: string | null
          main_benefit?: string | null
          main_task?: string | null
          other_features?: string | null
          pages?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          status?: string | null
          target_audience?: string | null
          target_platform?: string | null
          template_id?: string | null
          text_color?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          app_name?: string
          background_color?: string | null
          created_at?: string
          custom_font?: string | null
          daily_users?: string | null
          font_family?: string | null
          generated_prompt?: string | null
          id?: string
          language?: string | null
          main_benefit?: string | null
          main_task?: string | null
          other_features?: string | null
          pages?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          status?: string | null
          target_audience?: string | null
          target_platform?: string | null
          template_id?: string | null
          text_color?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          client_id: string | null
          created_at: string
          created_by_user_id: string | null
          custom_origin: string | null
          custom_service_type: string | null
          deliverables: string | null
          description: string | null
          estimated_deadline: string | null
          id: string
          observations: string | null
          payment_terms: string | null
          planning_id: string | null
          project_id: string | null
          prospect_email: string | null
          prospect_name: string | null
          prospect_phone: string | null
          service_type: string
          status: string
          title: string
          total_value: number | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          custom_origin?: string | null
          custom_service_type?: string | null
          deliverables?: string | null
          description?: string | null
          estimated_deadline?: string | null
          id?: string
          observations?: string | null
          payment_terms?: string | null
          planning_id?: string | null
          project_id?: string | null
          prospect_email?: string | null
          prospect_name?: string | null
          prospect_phone?: string | null
          service_type: string
          status?: string
          title: string
          total_value?: number | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          created_by_user_id?: string | null
          custom_origin?: string | null
          custom_service_type?: string | null
          deliverables?: string | null
          description?: string | null
          estimated_deadline?: string | null
          id?: string
          observations?: string | null
          payment_terms?: string | null
          planning_id?: string | null
          project_id?: string | null
          prospect_email?: string | null
          prospect_name?: string | null
          prospect_phone?: string | null
          service_type?: string
          status?: string
          title?: string
          total_value?: number | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_planning_id_fkey"
            columns: ["planning_id"]
            isOneToOne: false
            referencedRelation: "nexia_plannings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      solution_contracts: {
        Row: {
          additional_clauses: string | null
          client_document: string | null
          client_name: string | null
          client_type: string | null
          contract_generated_at: string | null
          contract_text: string | null
          contracted_document: string | null
          contracted_name: string
          contractor_address: string | null
          contractor_city: string | null
          contractor_document: string | null
          contractor_name: string
          contractor_type: string | null
          created_at: string
          created_by_user_id: string | null
          deadline: string | null
          delivery_start: string | null
          exclusions: string | null
          functionalities: string | null
          id: string
          include_maintenance: boolean | null
          maintenance_value: number | null
          payment_terms: string | null
          platforms: string[] | null
          portfolio_rights: boolean | null
          project_id: string | null
          proposal_id: string | null
          service_description: string | null
          service_value: number | null
          status: string
          termination_penalty: boolean | null
          transfer_after_payment: boolean | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          additional_clauses?: string | null
          client_document?: string | null
          client_name?: string | null
          client_type?: string | null
          contract_generated_at?: string | null
          contract_text?: string | null
          contracted_document?: string | null
          contracted_name: string
          contractor_address?: string | null
          contractor_city?: string | null
          contractor_document?: string | null
          contractor_name: string
          contractor_type?: string | null
          created_at?: string
          created_by_user_id?: string | null
          deadline?: string | null
          delivery_start?: string | null
          exclusions?: string | null
          functionalities?: string | null
          id?: string
          include_maintenance?: boolean | null
          maintenance_value?: number | null
          payment_terms?: string | null
          platforms?: string[] | null
          portfolio_rights?: boolean | null
          project_id?: string | null
          proposal_id?: string | null
          service_description?: string | null
          service_value?: number | null
          status?: string
          termination_penalty?: boolean | null
          transfer_after_payment?: boolean | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          additional_clauses?: string | null
          client_document?: string | null
          client_name?: string | null
          client_type?: string | null
          contract_generated_at?: string | null
          contract_text?: string | null
          contracted_document?: string | null
          contracted_name?: string
          contractor_address?: string | null
          contractor_city?: string | null
          contractor_document?: string | null
          contractor_name?: string
          contractor_type?: string | null
          created_at?: string
          created_by_user_id?: string | null
          deadline?: string | null
          delivery_start?: string | null
          exclusions?: string | null
          functionalities?: string | null
          id?: string
          include_maintenance?: boolean | null
          maintenance_value?: number | null
          payment_terms?: string | null
          platforms?: string[] | null
          portfolio_rights?: boolean | null
          project_id?: string | null
          proposal_id?: string | null
          service_description?: string | null
          service_value?: number | null
          status?: string
          termination_penalty?: boolean | null
          transfer_after_payment?: boolean | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "solution_contracts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solution_contracts_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "solution_proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "solution_contracts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      solution_proposals: {
        Row: {
          company_name: string
          contact_name: string | null
          created_at: string
          created_by_user_id: string | null
          deadline: string | null
          id: string
          observations: string | null
          payment_method: string | null
          proposal_generated_at: string | null
          proposal_text: string | null
          scope_items: string[] | null
          service_offered: string
          service_value: number | null
          status: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          company_name: string
          contact_name?: string | null
          created_at?: string
          created_by_user_id?: string | null
          deadline?: string | null
          id?: string
          observations?: string | null
          payment_method?: string | null
          proposal_generated_at?: string | null
          proposal_text?: string | null
          scope_items?: string[] | null
          service_offered: string
          service_value?: number | null
          status?: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          company_name?: string
          contact_name?: string | null
          created_at?: string
          created_by_user_id?: string | null
          deadline?: string | null
          id?: string
          observations?: string | null
          payment_method?: string | null
          proposal_generated_at?: string | null
          proposal_text?: string | null
          scope_items?: string[] | null
          service_offered?: string
          service_value?: number | null
          status?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "solution_proposals_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          id: string
          plan_name: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan_name?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          plan_name?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_metrics: {
        Row: {
          completed_cycles: number
          created_at: string
          id: string
          reference_date: string
          team_data: Json
          updated_at: string
          workspace_id: string
        }
        Insert: {
          completed_cycles?: number
          created_at?: string
          id?: string
          reference_date?: string
          team_data?: Json
          updated_at?: string
          workspace_id: string
        }
        Update: {
          completed_cycles?: number
          created_at?: string
          id?: string
          reference_date?: string
          team_data?: Json
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_metrics_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: true
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          niche: string | null
          one_liner: string | null
          operation_name: string | null
          tone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          niche?: string | null
          one_liner?: string | null
          operation_name?: string | null
          tone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          niche?: string | null
          one_liner?: string | null
          operation_name?: string | null
          tone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_access_status: { Args: { _user_id: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_active_credit_request: {
        Args: { _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_owner: { Args: { _user_id: string }; Returns: boolean }
      is_device_blocked: { Args: { _device_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "user" | "admin" | "owner"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "admin", "owner"],
    },
  },
} as const
