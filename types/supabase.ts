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
      BANNERS: {
        Row: {
          active: boolean | null
          created_at: string | null
          emoji: string | null
          expires_at: string | null
          gradient_end: string
          gradient_start: string
          id: string
          subtitle: string | null
          title: string
          type: string | null
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          emoji?: string | null
          expires_at?: string | null
          gradient_end: string
          gradient_start: string
          id?: string
          subtitle?: string | null
          title: string
          type?: string | null
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          emoji?: string | null
          expires_at?: string | null
          gradient_end?: string
          gradient_start?: string
          id?: string
          subtitle?: string | null
          title?: string
          type?: string | null
        }
        Relationships: []
      }
      COUNTRY: {
        Row: {
          flag_emoji: string | null
          iso_code: string
          iso_code_3: string | null
          m49_code: number
          name: string
        }
        Insert: {
          flag_emoji?: string | null
          iso_code: string
          iso_code_3?: string | null
          m49_code: number
          name: string
        }
        Update: {
          flag_emoji?: string | null
          iso_code?: string
          iso_code_3?: string | null
          m49_code?: number
          name?: string
        }
        Relationships: []
      }
      COUNTRY_REGION: {
        Row: {
          country_m49: number | null
          created_at: string
          id: number
          region_m49: number | null
        }
        Insert: {
          country_m49?: number | null
          created_at?: string
          id?: number
          region_m49?: number | null
        }
        Update: {
          country_m49?: number | null
          created_at?: string
          id?: number
          region_m49?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "COUNTRY_REGION_country_m49_fkey"
            columns: ["country_m49"]
            isOneToOne: false
            referencedRelation: "COUNTRY"
            referencedColumns: ["m49_code"]
          },
          {
            foreignKeyName: "UBICATION_REGION_region_id_fkey"
            columns: ["region_m49"]
            isOneToOne: false
            referencedRelation: "REGION"
            referencedColumns: ["id"]
          },
        ]
      }
      GUEST_PLAYER: {
        Row: {
          added_by: string
          assists: number
          birth_year: number | null
          created_at: string
          dominant_leg: string | null
          gender: string | null
          goals: number
          id: string
          is_active: boolean
          lastname: string | null
          name: string
          number: number | null
          phone_number: number | null
          photo: string | null
          position: string | null
          red_cards: number
          team_id: string
          yellow_cards: number
        }
        Insert: {
          added_by: string
          assists?: number
          birth_year?: number | null
          created_at?: string
          dominant_leg?: string | null
          gender?: string | null
          goals?: number
          id?: string
          is_active?: boolean
          lastname?: string | null
          name: string
          number?: number | null
          phone_number?: number | null
          photo?: string | null
          position?: string | null
          red_cards?: number
          team_id: string
          yellow_cards?: number
        }
        Update: {
          added_by?: string
          assists?: number
          birth_year?: number | null
          created_at?: string
          dominant_leg?: string | null
          gender?: string | null
          goals?: number
          id?: string
          is_active?: boolean
          lastname?: string | null
          name?: string
          number?: number | null
          phone_number?: number | null
          photo?: string | null
          position?: string | null
          red_cards?: number
          team_id?: string
          yellow_cards?: number
        }
        Relationships: [
          {
            foreignKeyName: "guest_player_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "PROFILE"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guest_player_team_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "TEAM"
            referencedColumns: ["id"]
          },
        ]
      }
      kv_store_939e0477: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
        }
        Relationships: []
      }
      MATCH: {
        Row: {
          arrival_time: string | null
          away_score: number | null
          away_team_id: string | null
          bet: string | null
          created_at: string
          created_by: string | null
          date: string | null
          description: string | null
          goalkeeper_free: boolean
          group_id: string | null
          home_score: number | null
          home_team_id: string | null
          id: string
          is_open: boolean
          location_url: string | null
          match_round: number | null
          match_type: string | null
          max_players: number | null
          next_match_id: string | null
          payment_info: string | null
          place: string | null
          referee: string | null
          rules: string | null
          stage_id: string | null
          status: string | null
          team_id: string | null
          torneo_id: string | null
          ubication_id: string | null
        }
        Insert: {
          arrival_time?: string | null
          away_score?: number | null
          away_team_id?: string | null
          bet?: string | null
          created_at?: string
          created_by?: string | null
          date?: string | null
          description?: string | null
          goalkeeper_free?: boolean
          group_id?: string | null
          home_score?: number | null
          home_team_id?: string | null
          id?: string
          is_open?: boolean
          location_url?: string | null
          match_round?: number | null
          match_type?: string | null
          max_players?: number | null
          next_match_id?: string | null
          payment_info?: string | null
          place?: string | null
          referee?: string | null
          rules?: string | null
          stage_id?: string | null
          status?: string | null
          team_id?: string | null
          torneo_id?: string | null
          ubication_id?: string | null
        }
        Update: {
          arrival_time?: string | null
          away_score?: number | null
          away_team_id?: string | null
          bet?: string | null
          created_at?: string
          created_by?: string | null
          date?: string | null
          description?: string | null
          goalkeeper_free?: boolean
          group_id?: string | null
          home_score?: number | null
          home_team_id?: string | null
          id?: string
          is_open?: boolean
          location_url?: string | null
          match_round?: number | null
          match_type?: string | null
          max_players?: number | null
          next_match_id?: string | null
          payment_info?: string | null
          place?: string | null
          referee?: string | null
          rules?: string | null
          stage_id?: string | null
          status?: string | null
          team_id?: string | null
          torneo_id?: string | null
          ubication_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "match_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "TEAM"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "MATCH_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "PROFILE"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "TORNEO_GROUP"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "TEAM"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_next_match_id_fkey"
            columns: ["next_match_id"]
            isOneToOne: false
            referencedRelation: "MATCH"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "TORNEO_STAGE"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "MATCH_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "TEAM"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "MATCH_torneo_id_fkey"
            columns: ["torneo_id"]
            isOneToOne: false
            referencedRelation: "TORNEO"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "MATCH_ubication_id_fkey"
            columns: ["ubication_id"]
            isOneToOne: false
            referencedRelation: "UBICATION"
            referencedColumns: ["id"]
          },
        ]
      }
      MATCH_PARTICIPANTS: {
        Row: {
          created_at: string
          id: string
          match_id: string | null
          profile_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          match_id?: string | null
          profile_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          match_id?: string | null
          profile_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "MATCH_PARTICIPANTS_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "MATCH"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "MATCH_PARTICIPANTS_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "PROFILE"
            referencedColumns: ["id"]
          },
        ]
      }
      MUNICIPALITY: {
        Row: {
          code: string
          code_type: string | null
          id: string
          name: string
          state_iso_code: string
        }
        Insert: {
          code: string
          code_type?: string | null
          id?: string
          name: string
          state_iso_code: string
        }
        Update: {
          code?: string
          code_type?: string | null
          id?: string
          name?: string
          state_iso_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "municipality_state_fkey"
            columns: ["state_iso_code"]
            isOneToOne: false
            referencedRelation: "STATE"
            referencedColumns: ["iso_code"]
          },
        ]
      }
      PROFILE: {
        Row: {
          auth_id: string | null
          avatar_url: string | null
          birth_year: number | null
          created_at: string
          dominant_leg: string | null
          email: string | null
          expo_push_token: string | null
          gender: string | null
          id: string
          lastname: string | null
          name: string | null
          phone_number: number | null
          recovery_question: number | null
          recovery_response: string | null
          role_id: string | null
          second_lastname: string | null
          second_name: string | null
          ubication_id: string | null
        }
        Insert: {
          auth_id?: string | null
          avatar_url?: string | null
          birth_year?: number | null
          created_at?: string
          dominant_leg?: string | null
          email?: string | null
          expo_push_token?: string | null
          gender?: string | null
          id?: string
          lastname?: string | null
          name?: string | null
          phone_number?: number | null
          recovery_question?: number | null
          recovery_response?: string | null
          role_id?: string | null
          second_lastname?: string | null
          second_name?: string | null
          ubication_id?: string | null
        }
        Update: {
          auth_id?: string | null
          avatar_url?: string | null
          birth_year?: number | null
          created_at?: string
          dominant_leg?: string | null
          email?: string | null
          expo_push_token?: string | null
          gender?: string | null
          id?: string
          lastname?: string | null
          name?: string | null
          phone_number?: number | null
          recovery_question?: number | null
          recovery_response?: string | null
          role_id?: string | null
          second_lastname?: string | null
          second_name?: string | null
          ubication_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "PROFILE_recovery_question_fkey"
            columns: ["recovery_question"]
            isOneToOne: false
            referencedRelation: "RECOVERY_QUESTIONS"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "PROFILE_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "ROLE"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "PROFILE_ubication_id_fkey"
            columns: ["ubication_id"]
            isOneToOne: false
            referencedRelation: "UBICATION"
            referencedColumns: ["id"]
          },
        ]
      }
      PROFILE_TEAM: {
        Row: {
          created_at: string
          id: string
          profile_id: string | null
          status: boolean | null
          team_id: string | null
          team_role: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id?: string | null
          status?: boolean | null
          team_id?: string | null
          team_role?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string | null
          status?: boolean | null
          team_id?: string | null
          team_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "PROFILE_TEAM_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "PROFILE"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "PROFILE_TEAM_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "TEAM"
            referencedColumns: ["id"]
          },
        ]
      }
      RECOVERY_QUESTIONS: {
        Row: {
          created_at: string
          id: number
          question: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          question?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          question?: string | null
        }
        Relationships: []
      }
      REGION: {
        Row: {
          created_at: string
          id: number
          name: string | null
          type: string | null
        }
        Insert: {
          created_at?: string
          id: number
          name?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          name?: string | null
          type?: string | null
        }
        Relationships: []
      }
      ROLE: {
        Row: {
          created_at: string
          id: string
          name: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      STATE: {
        Row: {
          country_iso_code: string
          iso_code: string
          name: string
        }
        Insert: {
          country_iso_code: string
          iso_code: string
          name: string
        }
        Update: {
          country_iso_code?: string
          iso_code?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "state_country_fkey"
            columns: ["country_iso_code"]
            isOneToOne: false
            referencedRelation: "COUNTRY"
            referencedColumns: ["iso_code"]
          },
        ]
      }
      TEAM: {
        Row: {
          coach: string | null
          code: string | null
          created_at: string
          created_by: string | null
          founded: string | null
          gender: string | null
          id: string
          is_artificial: boolean
          logo: string | null
          name: string | null
          shield_url: string | null
          ubication_id: string | null
        }
        Insert: {
          coach?: string | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          founded?: string | null
          gender?: string | null
          id?: string
          is_artificial?: boolean
          logo?: string | null
          name?: string | null
          shield_url?: string | null
          ubication_id?: string | null
        }
        Update: {
          coach?: string | null
          code?: string | null
          created_at?: string
          created_by?: string | null
          founded?: string | null
          gender?: string | null
          id?: string
          is_artificial?: boolean
          logo?: string | null
          name?: string | null
          shield_url?: string | null
          ubication_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "TEAM_ubication_id_fkey"
            columns: ["ubication_id"]
            isOneToOne: false
            referencedRelation: "UBICATION"
            referencedColumns: ["id"]
          },
        ]
      }
      TEAM_CHALLENGE: {
        Row: {
          challenged_team_id: string | null
          challenger_team_id: string | null
          created_at: string
          id: string
          match_id: string | null
          message: string | null
          proposed_date: string | null
          proposed_ubication_id: string | null
          responded_at: string | null
          status: string | null
        }
        Insert: {
          challenged_team_id?: string | null
          challenger_team_id?: string | null
          created_at?: string
          id?: string
          match_id?: string | null
          message?: string | null
          proposed_date?: string | null
          proposed_ubication_id?: string | null
          responded_at?: string | null
          status?: string | null
        }
        Update: {
          challenged_team_id?: string | null
          challenger_team_id?: string | null
          created_at?: string
          id?: string
          match_id?: string | null
          message?: string | null
          proposed_date?: string | null
          proposed_ubication_id?: string | null
          responded_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_challenge_challenged_fkey"
            columns: ["challenged_team_id"]
            isOneToOne: false
            referencedRelation: "TEAM"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_challenge_challenger_fkey"
            columns: ["challenger_team_id"]
            isOneToOne: false
            referencedRelation: "TEAM"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_challenge_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "MATCH"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_challenge_ubication_id_fkey"
            columns: ["proposed_ubication_id"]
            isOneToOne: false
            referencedRelation: "UBICATION"
            referencedColumns: ["id"]
          },
        ]
      }
      TEAM_STATS: {
        Row: {
          created_at: string
          current_streak: number
          drawn: number
          goals_against: number
          goals_for: number
          id: string
          lost: number
          played: number
          team_id: string
          updated_at: string
          win_streak: number
          won: number
        }
        Insert: {
          created_at?: string
          current_streak?: number
          drawn?: number
          goals_against?: number
          goals_for?: number
          id?: string
          lost?: number
          played?: number
          team_id: string
          updated_at?: string
          win_streak?: number
          won?: number
        }
        Update: {
          created_at?: string
          current_streak?: number
          drawn?: number
          goals_against?: number
          goals_for?: number
          id?: string
          lost?: number
          played?: number
          team_id?: string
          updated_at?: string
          win_streak?: number
          won?: number
        }
        Relationships: [
          {
            foreignKeyName: "team_stats_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: true
            referencedRelation: "TEAM"
            referencedColumns: ["id"]
          },
        ]
      }
      TORNEO: {
        Row: {
          created_at: string
          end_date: string | null
          format_description: string | null
          gender: string | null
          id: string
          level: string | null
          logo: string | null
          modality: string | null
          name: string | null
          period: string | null
          prizes: Json | null
          registration_fee: number | null
          season: string | null
          start_date: string | null
          status: string | null
          teams_count: number
          total_teams: number | null
          type: string | null
          ubication_id: string | null
          venues: Json | null
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          format_description?: string | null
          gender?: string | null
          id?: string
          level?: string | null
          logo?: string | null
          modality?: string | null
          name?: string | null
          period?: string | null
          prizes?: Json | null
          registration_fee?: number | null
          season?: string | null
          start_date?: string | null
          status?: string | null
          teams_count?: number
          total_teams?: number | null
          type?: string | null
          ubication_id?: string | null
          venues?: Json | null
        }
        Update: {
          created_at?: string
          end_date?: string | null
          format_description?: string | null
          gender?: string | null
          id?: string
          level?: string | null
          logo?: string | null
          modality?: string | null
          name?: string | null
          period?: string | null
          prizes?: Json | null
          registration_fee?: number | null
          season?: string | null
          start_date?: string | null
          status?: string | null
          teams_count?: number
          total_teams?: number | null
          type?: string | null
          ubication_id?: string | null
          venues?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "TORNEO_ubication_id_fkey"
            columns: ["ubication_id"]
            isOneToOne: false
            referencedRelation: "UBICATION"
            referencedColumns: ["id"]
          },
        ]
      }
      TORNEO_ADMINS: {
        Row: {
          created_at: string | null
          id: string
          profile_id: string | null
          role: string | null
          torneo_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          profile_id?: string | null
          role?: string | null
          torneo_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_id?: string | null
          role?: string | null
          torneo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "TORNEO_ADMINS_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "PROFILE"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "TORNEO_ADMINS_torneo_id_fkey"
            columns: ["torneo_id"]
            isOneToOne: false
            referencedRelation: "TORNEO"
            referencedColumns: ["id"]
          },
        ]
      }
      TORNEO_GROUP: {
        Row: {
          created_at: string
          id: string
          name: string | null
          stage_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          stage_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          stage_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "torneo_group_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "TORNEO_STAGE"
            referencedColumns: ["id"]
          },
        ]
      }
      TORNEO_GROUP_TEAMS: {
        Row: {
          created_at: string
          drawn: number
          goals_against: number
          goals_for: number
          group_id: string | null
          id: string
          lost: number
          played: number
          points: number
          team_id: string | null
          won: number
        }
        Insert: {
          created_at?: string
          drawn?: number
          goals_against?: number
          goals_for?: number
          group_id?: string | null
          id?: string
          lost?: number
          played?: number
          points?: number
          team_id?: string | null
          won?: number
        }
        Update: {
          created_at?: string
          drawn?: number
          goals_against?: number
          goals_for?: number
          group_id?: string | null
          id?: string
          lost?: number
          played?: number
          points?: number
          team_id?: string | null
          won?: number
        }
        Relationships: [
          {
            foreignKeyName: "torneo_group_teams_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "TORNEO_GROUP"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "torneo_group_teams_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "TEAM"
            referencedColumns: ["id"]
          },
        ]
      }
      TORNEO_STAGE: {
        Row: {
          created_at: string
          id: string
          name: string | null
          stage_order: number | null
          status: string | null
          torneo_id: string | null
          type: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          stage_order?: number | null
          status?: string | null
          torneo_id?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          stage_order?: number | null
          status?: string | null
          torneo_id?: string | null
          type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "torneo_stage_torneo_id_fkey"
            columns: ["torneo_id"]
            isOneToOne: false
            referencedRelation: "TORNEO"
            referencedColumns: ["id"]
          },
        ]
      }
      TORNEO_STANDING: {
        Row: {
          created_at: string
          drawn: number
          goal_difference: number | null
          goals_against: number
          goals_for: number
          id: string
          lost: number
          played: number
          points: number
          position: number | null
          stage_id: string | null
          team_id: string | null
          torneo_id: string | null
          updated_at: string
          won: number
        }
        Insert: {
          created_at?: string
          drawn?: number
          goal_difference?: number | null
          goals_against?: number
          goals_for?: number
          id?: string
          lost?: number
          played?: number
          points?: number
          position?: number | null
          stage_id?: string | null
          team_id?: string | null
          torneo_id?: string | null
          updated_at?: string
          won?: number
        }
        Update: {
          created_at?: string
          drawn?: number
          goal_difference?: number | null
          goals_against?: number
          goals_for?: number
          id?: string
          lost?: number
          played?: number
          points?: number
          position?: number | null
          stage_id?: string | null
          team_id?: string | null
          torneo_id?: string | null
          updated_at?: string
          won?: number
        }
        Relationships: [
          {
            foreignKeyName: "torneo_standing_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "TORNEO_STAGE"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "torneo_standing_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "TEAM"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "torneo_standing_torneo_id_fkey"
            columns: ["torneo_id"]
            isOneToOne: false
            referencedRelation: "TORNEO"
            referencedColumns: ["id"]
          },
        ]
      }
      TORNEO_TEAMS: {
        Row: {
          created_at: string
          id: string
          status: string | null
          team_id: string | null
          torneo_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string | null
          team_id?: string | null
          torneo_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          status?: string | null
          team_id?: string | null
          torneo_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "TORNEO_TEAMS_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "TEAM"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "TORNEO_TEAMS_torneo_id_fkey"
            columns: ["torneo_id"]
            isOneToOne: false
            referencedRelation: "TORNEO"
            referencedColumns: ["id"]
          },
        ]
      }
      UBICATION: {
        Row: {
          country_iso_code: string | null
          created_at: string
          id: string
          municipality_id: string | null
          state_iso_code: string | null
        }
        Insert: {
          country_iso_code?: string | null
          created_at?: string
          id?: string
          municipality_id?: string | null
          state_iso_code?: string | null
        }
        Update: {
          country_iso_code?: string | null
          created_at?: string
          id?: string
          municipality_id?: string | null
          state_iso_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ubication_country_fkey"
            columns: ["country_iso_code"]
            isOneToOne: false
            referencedRelation: "COUNTRY"
            referencedColumns: ["iso_code"]
          },
          {
            foreignKeyName: "ubication_municipality_fkey"
            columns: ["municipality_id"]
            isOneToOne: false
            referencedRelation: "MUNICIPALITY"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ubication_state_fkey"
            columns: ["state_iso_code"]
            isOneToOne: false
            referencedRelation: "STATE"
            referencedColumns: ["iso_code"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_challenge_match: {
        Args: { p_match_id: string; p_team_id: string }
        Returns: undefined
      }
      accept_team_challenge: {
        Args: { p_challenge_id: string }
        Returns: undefined
      }
      create_individual_match:
        | {
            Args: {
              p_bet?: string
              p_date: string
              p_description?: string
              p_max_players: number
              p_place: string
              p_profile_id: string
            }
            Returns: string
          }
        | {
            Args: {
              p_arrival_time?: string
              p_bet?: string
              p_date: string
              p_description?: string
              p_goalkeeper_free?: boolean
              p_location_url?: string
              p_match_type?: string
              p_max_players: number
              p_payment_info?: string
              p_place: string
              p_profile_id: string
              p_rules?: string
            }
            Returns: string
          }
      create_team: {
        Args: { p_name: string; p_profile_id: string }
        Returns: string
      }
      create_team_challenge: {
        Args: {
          p_bet?: string
          p_challenged_team_id: string
          p_challenger_team_id: string
          p_message?: string
          p_place: string
          p_proposed_date: string
          p_proposed_ubication_id: string
        }
        Returns: string
      }
      get_matches_played: {
        Args: { p_profile_id: string; p_team_id: string }
        Returns: {
          away_score: number
          away_team_id: string
          away_team_name: string
          away_team_shield_url: string
          bet: string
          created_by: string
          date: string
          home_score: number
          home_team_id: string
          home_team_name: string
          home_team_shield_url: string
          match_id: string
          match_type: string
          place: string
          status: string
        }[]
      }
      get_my_open_matches: {
        Args: { p_team_id: string; p_ubication_id: string }
        Returns: {
          bet: string
          date: string
          home_team_id: string
          home_team_name: string
          match_id: string
          municipality_name: string
          place: string
          state_name: string
          status: string
        }[]
      }
      get_open_individual_matches: {
        Args: { p_profile_id: string }
        Returns: {
          arrival_time: string
          bet: string
          created_by: string
          current_players: number
          date: string
          description: string
          goalkeeper_free: boolean
          location_url: string
          match_id: string
          match_type: string
          max_players: number
          municipality_name: string
          participants: Json
          payment_info: string
          place: string
          rules: string
          state_name: string
          status: string
        }[]
      }
      get_open_matches: {
        Args: { p_team_id: string; p_ubication_id: string }
        Returns: {
          bet: string
          date: string
          home_team_id: string
          home_team_name: string
          home_team_shield_url: string
          match_id: string
          municipality_name: string
          place: string
          state_name: string
          status: string
        }[]
      }
      get_scheduled_matches:
        | {
            Args: { p_team_id: string }
            Returns: {
              away_team_id: string
              away_team_name: string
              bet: string
              date: string
              home_team_id: string
              home_team_name: string
              match_id: string
              place: string
              status: string
            }[]
          }
        | {
            Args: { p_profile_id: string; p_team_id: string }
            Returns: {
              away_team_id: string
              away_team_name: string
              bet: string
              date: string
              home_team_id: string
              home_team_name: string
              match_id: string
              match_type: string
              place: string
              status: string
            }[]
          }
      get_scheduled_matches_v2: {
        Args: { p_profile_id: string; p_team_id: string }
        Returns: {
          away_team_id: string
          away_team_name: string
          away_team_shield_url: string
          bet: string
          date: string
          home_team_id: string
          home_team_name: string
          home_team_shield_url: string
          match_id: string
          match_type: string
          place: string
          status: string
          torneo_name: string
        }[]
      }
      get_team_challenges_received: {
        Args: { p_team_id: string }
        Returns: {
          bet: string
          challenge_id: string
          challenger_team_id: string
          challenger_team_name: string
          challenger_team_shield_url: string
          match_id: string
          match_place: string
          message: string
          proposed_date: string
          proposed_municipality_name: string
          proposed_state_name: string
          status: string
        }[]
      }
      get_team_info: {
        Args: { p_team_id: string }
        Returns: {
          current_streak: number
          drawn: number
          goals_against: number
          goals_for: number
          lost: number
          played: number
          player_count: number
          team_code: string
          team_id: string
          team_logo: string
          team_name: string
          win_streak: number
          won: number
        }[]
      }
      get_team_players: {
        Args: { team_uuid: string }
        Returns: {
          auth_id: string
          avatar_url: string
          birth_year: number
          created_at: string
          dominant_leg: string
          gender: string
          lastname: string
          name: string
          phone_number: number
          profile_id: string
          role: string
          second_lastname: string
          second_name: string
        }[]
      }
      get_torneo_detail: { Args: { p_torneo_id: string }; Returns: Json }
      get_user_profile: {
        Args: { p_profile_id: string }
        Returns: {
          avatar_url: string
          birth_year: number
          country_iso_code: string
          country_name: string
          dominant_leg: string
          lastname: string
          municipality_id: string
          municipality_name: string
          name: string
          phone_number: number
          role_id: string
          role_name: string
          second_lastname: string
          second_name: string
          state_iso_code: string
          state_name: string
          team_code: string
          team_country_iso_code: string
          team_country_name: string
          team_id: string
          team_municipality_id: string
          team_municipality_name: string
          team_name: string
          team_role: string
          team_shield_url: string
          team_state_iso_code: string
          team_state_name: string
          team_ubication_id: string
          user_gender: string
          user_ubication_id: string
        }[]
      }
      join_individual_match: {
        Args: { p_match_id: string; p_profile_id: string }
        Returns: string
      }
      join_team: {
        Args: { p_profile_id: string; p_team_code: string }
        Returns: string
      }
      leave_individual_match: {
        Args: { p_match_id: string; p_profile_id: string }
        Returns: string
      }
      register_team_to_tournament: {
        Args: { p_code_team: string; p_torneo_id: string }
        Returns: undefined
      }
      reject_team_challenge: {
        Args: { p_challenge_id: string }
        Returns: undefined
      }
      update_profile_location: {
        Args: {
          p_country_iso_code: string
          p_municipality_id: string
          p_profile_id: string
          p_state_iso_code: string
        }
        Returns: boolean
      }
      update_profile_location_by_auth: {
        Args: {
          p_auth_id: string
          p_country_iso_code: string
          p_municipality_id: string
          p_state_iso_code: string
        }
        Returns: boolean
      }
      update_team_standing: {
        Args: { p_stage_id: string; p_team_id: string; p_torneo_id: string }
        Returns: undefined
      }
      update_team_standing_v2: {
        Args: { p_stage_id: string; p_team_id: string; p_torneo_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
