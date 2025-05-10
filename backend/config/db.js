import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const createTables = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS public.users (
      id serial,
      name varchar(255) NOT NULL,
      email varchar(255) NOT NULL UNIQUE,
      password text NOT NULL,
      is_verified boolean DEFAULT false,
      created_at timestamp DEFAULT CURRENT_TIMESTAMP,
      is_banned boolean DEFAULT false,
      onboarding boolean DEFAULT false,
      is_2faenabled boolean DEFAULT false,
      CONSTRAINT users_pkey PRIMARY KEY (id),
      CONSTRAINT users_email_key UNIQUE (email)
    );
    
    CREATE TABLE IF NOT EXISTS public.admins (
      id serial,
      name varchar(255) NOT NULL,
      email varchar(255) NOT NULL UNIQUE,
      password text NOT NULL,
      role varchar(20) DEFAULT 'admin',
      created_at timestamp DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp DEFAULT now(),
      CONSTRAINT admins_pkey PRIMARY KEY (id),
      CONSTRAINT admins_role_check CHECK (
        role IN ('admin', 'super_admin', 'Commissioner')
      )
    );

    CREATE TABLE IF NOT EXISTS public.commissioners (
      id serial,
      name varchar(255) NOT NULL,
      email varchar(255) NOT NULL UNIQUE,
      password text NOT NULL,
      added_by integer,
      created_at timestamp DEFAULT CURRENT_TIMESTAMP,
      role varchar(255),
      CONSTRAINT commissioners_pkey PRIMARY KEY (id),
      CONSTRAINT commissioners_email_key UNIQUE (email)
    );

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'commissioners_added_by_fkey'
      ) THEN
        ALTER TABLE public.commissioners
        ADD CONSTRAINT commissioners_added_by_fkey
        FOREIGN KEY (added_by)
        REFERENCES public.admins(id)
        ON DELETE SET NULL;
      END IF;
    END
    $$;

    CREATE TABLE IF NOT EXISTS public.email_verifications (
      id serial,
      user_id integer NOT NULL,
      token text NOT NULL,
      expires_at timestamp NOT NULL,
      CONSTRAINT email_verifications_pkey PRIMARY KEY (id)
    );

    CREATE TABLE IF NOT EXISTS public.nationid (
      id SERIAL PRIMARY KEY,
      id_number VARCHAR(50) UNIQUE NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      date_of_birth DATE NOT NULL,
      gender CHAR(1) CHECK (gender IN ('M', 'F', 'O')) NOT NULL,
      address TEXT,
      mother_name VARCHAR(255),
      father_name VARCHAR(255),
      is_valid BOOLEAN NOT NULL,
      is_active BOOLEAN NOT NULL,
      issued_at DATE NOT NULL,
      expires_at DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS public.national_ids (
        id SERIAL PRIMARY KEY,
        id_number VARCHAR(50) NOT NULL,
        user_id VARCHAR(50) NOT NULL,
        verified_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT national_ids_id_number_user_id_unique UNIQUE (id_number, user_id)
    );

    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'fk_national_id'
        ) THEN
            ALTER TABLE public.national_ids
            ADD CONSTRAINT fk_national_id
            FOREIGN KEY (id_number)
            REFERENCES public.nationid (id_number)
            ON DELETE CASCADE;
        END IF;
    END
    $$;

    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints
            WHERE constraint_name = 'fk_user'
        ) THEN
            ALTER TABLE public.national_ids
            ADD CONSTRAINT fk_user
            FOREIGN KEY (user_id)
            REFERENCES public.users (id)
            ON DELETE CASCADE;
        END IF;
    END
    $$;


    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'email_verifications_user_id_fkey'
      ) THEN
        ALTER TABLE public.email_verifications
        ADD CONSTRAINT email_verifications_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users(id)
        ON DELETE CASCADE;
      END IF;
    END
    $$;

    -- Create questions table first since candidates references it
    CREATE TABLE IF NOT EXISTS public.questions (
      id serial,
      election_id integer,
      title text,
      description text,
      shuffle boolean,
      created_at timestamp DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp DEFAULT CURRENT_TIMESTAMP,
      options integer DEFAULT 0,
      CONSTRAINT questions_pkey PRIMARY KEY (id)
    );

    CREATE TABLE IF NOT EXISTS public.candidates (
      id serial,
      question_id integer,
      candidate_name varchar(255),
      candidate_bio text,
      description text,
      created_at timestamp DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp DEFAULT CURRENT_TIMESTAMP,
      image varchar(255),
      CONSTRAINT candidates_pkey PRIMARY KEY (id)
    );

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'candidates_question_id_fkey'
      ) THEN
        ALTER TABLE public.candidates
        ADD CONSTRAINT candidates_question_id_fkey
        FOREIGN KEY (question_id)
        REFERENCES public.questions(id)
        ON DELETE CASCADE;
      END IF;
    END
    $$;

    -- Create functions before creating triggers that use them
    CREATE OR REPLACE FUNCTION update_options_count_on_insert()
    RETURNS TRIGGER AS $$
    BEGIN
      UPDATE public.questions
      SET options = options + 1
      WHERE id = NEW.question_id;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION update_options_count_on_delete()
    RETURNS TRIGGER AS $$
    BEGIN
      UPDATE public.questions
      SET options = options - 1
      WHERE id = OLD.question_id;
      RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_options_count_on_insert'
      ) THEN
        CREATE TRIGGER trigger_update_options_count_on_insert
        AFTER INSERT ON public.candidates
        FOR EACH ROW
        EXECUTE FUNCTION update_options_count_on_insert();
      END IF;
    END
    $$;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_options_count_on_delete'
      ) THEN
        CREATE TRIGGER trigger_update_options_count_on_delete
        AFTER DELETE ON public.candidates
        FOR EACH ROW
        EXECUTE FUNCTION update_options_count_on_delete();
      END IF;
    END
    $$;

    CREATE TABLE IF NOT EXISTS public.elections (
      id serial,
      title varchar(255) NOT NULL,
      start_date timestamp NOT NULL,
      end_date timestamp NOT NULL,
      created_by_admin integer,
      created_by_commissioner integer,
      created_at timestamp DEFAULT CURRENT_TIMESTAMP,
      updated_at timestamp DEFAULT CURRENT_TIMESTAMP,
      status varchar(20) DEFAULT 'building',
      launched boolean DEFAULT false,
      description text,
      candidates integer DEFAULT 0,
      voters integer DEFAULT 0,
      ballot_questions integer DEFAULT 0,
      options integer DEFAULT 0,
      hide_result boolean DEFAULT false,
      results_published boolean DEFAULT false,
      CONSTRAINT elections_pkey PRIMARY KEY (id),
      CONSTRAINT elections_status_check CHECK (
        status IN ('building', 'scheduled', 'ongoing', 'finished', 'cancelled')
      )
    );

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'elections_created_by_admin_fkey'
      ) THEN
        ALTER TABLE public.elections
        ADD CONSTRAINT elections_created_by_admin_fkey
        FOREIGN KEY (created_by_admin)
        REFERENCES public.admins(id)
        ON DELETE CASCADE;
      END IF;
    END
    $$;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'elections_created_by_commissioner_fkey'
      ) THEN
        ALTER TABLE public.elections
        ADD CONSTRAINT elections_created_by_commissioner_fkey
        FOREIGN KEY (created_by_commissioner)
        REFERENCES public.commissioners(id)
        ON DELETE CASCADE;
      END IF;
    END
    $$;

    -- Create function for election status update
    CREATE OR REPLACE FUNCTION update_election_status()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.launched = true THEN
        UPDATE public.elections
        SET status = 'scheduled'
        WHERE id = NEW.id;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_election_status'
      ) THEN
        CREATE TRIGGER trigger_update_election_status
        AFTER UPDATE OF launched ON public.elections
        FOR EACH ROW
        WHEN (OLD.launched IS DISTINCT FROM NEW.launched)
        EXECUTE FUNCTION update_election_status();
      END IF;
    END
    $$;

    CREATE TABLE IF NOT EXISTS public.election_reminders (
      id serial,
      user_id integer,
      election_id integer,
      email varchar(255) NOT NULL,
      created_at timestamp DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT election_reminders_pkey PRIMARY KEY (id),
      CONSTRAINT election_reminders_user_id_election_id_key UNIQUE (user_id, election_id)
    );

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'election_reminders_election_id_fkey'
      ) THEN
        ALTER TABLE public.election_reminders
        ADD CONSTRAINT election_reminders_election_id_fkey
        FOREIGN KEY (election_id)
        REFERENCES public.elections(id)
        ON DELETE CASCADE;
      END IF;
    END
    $$;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'election_reminders_user_id_fkey'
      ) THEN
        ALTER TABLE public.election_reminders
        ADD CONSTRAINT election_reminders_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users(id)
        ON DELETE CASCADE;
      END IF;
    END
    $$;

    CREATE INDEX IF NOT EXISTS idx_reminders_user_election
    ON public.election_reminders (user_id, election_id);

    CREATE TABLE IF NOT EXISTS public.otps (
      id serial,
      user_id integer NOT NULL,
      otp varchar(6) NOT NULL,
      created_at timestamptz DEFAULT CURRENT_TIMESTAMP,
      expires_at timestamptz DEFAULT CURRENT_TIMESTAMP + interval '10 minutes',
      CONSTRAINT otps_pkey PRIMARY KEY (id)
    );

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'otps_user_id_fkey'
      ) THEN
        ALTER TABLE public.otps
        ADD CONSTRAINT otps_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users(id)
        ON DELETE CASCADE;
      END IF;
    END
    $$;

    CREATE TABLE IF NOT EXISTS public.password_resets (
      id serial,
      user_id integer NOT NULL,
      token text NOT NULL,
      expires_at timestamp NOT NULL,
      CONSTRAINT password_resets_pkey PRIMARY KEY (id)
    );

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'password_resets_user_id_fkey'
      ) THEN
        ALTER TABLE public.password_resets
        ADD CONSTRAINT password_resets_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users(id)
        ON DELETE CASCADE;
      END IF;
    END
    $$;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'questions_election_id_fkey'
      ) THEN
        ALTER TABLE public.questions
        ADD CONSTRAINT questions_election_id_fkey
        FOREIGN KEY (election_id)
        REFERENCES public.elections(id)
        ON DELETE CASCADE;
      END IF;
    END
    $$;

    -- Create function for questions count
    CREATE OR REPLACE FUNCTION update_questions_count_on_insert()
    RETURNS TRIGGER AS $$
    BEGIN
      UPDATE public.elections
      SET ballot_questions = ballot_questions + 1
      WHERE id = NEW.election_id;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE OR REPLACE FUNCTION update_questions_count_on_delete()
    RETURNS TRIGGER AS $$
    BEGIN
      UPDATE public.elections
      SET ballot_questions = ballot_questions - 1
      WHERE id = OLD.election_id;
      RETURN OLD;
    END;
    $$ LANGUAGE plpgsql;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_questions_count_on_insert'
      ) THEN
        CREATE TRIGGER trigger_update_questions_count_on_insert
        AFTER INSERT
        ON public.questions
        FOR EACH ROW
        EXECUTE FUNCTION update_questions_count_on_insert();
      END IF;
    END
    $$;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_questions_count_on_delete'
      ) THEN
        CREATE TRIGGER trigger_update_questions_count_on_delete
        AFTER DELETE
        ON public.questions
        FOR EACH ROW
        EXECUTE FUNCTION update_questions_count_on_delete();
      END IF;
    END
    $$;

    CREATE TABLE IF NOT EXISTS public.user_profiles (
      profile_id serial,
      user_id integer NOT NULL,
      full_name varchar(255),
      email varchar(255),
      phone varchar(20),
      dob date,
      gender varchar(50),
      country varchar(100),
      state varchar(100),
      city varchar(100),
      postal_code varchar(20),
      ethnicity varchar(100),
      occupation varchar(100),
      education varchar(100),
      profile_image varchar(255),
      CONSTRAINT user_profiles_pkey PRIMARY KEY (profile_id)
    );

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_profiles_user_id_fkey'
      ) THEN
        ALTER TABLE public.user_profiles
        ADD CONSTRAINT user_profiles_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users(id);
      END IF;
    END
    $$;

    CREATE TABLE IF NOT EXISTS public.votes (
      id serial,
      user_id integer,
      election_id integer,
      question_id integer,
      candidate_id integer,
      created_at timestamp DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT votes_pkey PRIMARY KEY (id),
      CONSTRAINT votes_user_id_election_id_question_id_key UNIQUE (user_id, election_id, question_id)
    );

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'votes_candidate_id_fkey'
      ) THEN
        ALTER TABLE public.votes
        ADD CONSTRAINT votes_candidate_id_fkey
        FOREIGN KEY (candidate_id)
        REFERENCES public.candidates(id)
        ON DELETE CASCADE;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'votes_election_id_fkey'
      ) THEN
        ALTER TABLE public.votes
        ADD CONSTRAINT votes_election_id_fkey
        FOREIGN KEY (election_id)
        REFERENCES public.elections(id)
        ON DELETE CASCADE;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'votes_question_id_fkey'
      ) THEN
        ALTER TABLE public.votes
        ADD CONSTRAINT votes_question_id_fkey
        FOREIGN KEY (question_id)
        REFERENCES public.questions(id)
        ON DELETE CASCADE;
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'votes_user_id_fkey'
      ) THEN
        ALTER TABLE public.votes
        ADD CONSTRAINT votes_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.users(id);
      END IF;
    END
    $$;

    -- Create function for voter count
    CREATE OR REPLACE FUNCTION increment_voter_count()
    RETURNS TRIGGER AS $$
    BEGIN
      UPDATE public.elections
      SET voters = (
        SELECT COUNT(DISTINCT user_id)
        FROM public.votes
        WHERE election_id = NEW.election_id
      )
      WHERE id = NEW.election_id;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_increment_voter_count'
      ) THEN
        CREATE TRIGGER trigger_increment_voter_count
        AFTER INSERT
        ON public.votes
        FOR EACH ROW
        EXECUTE FUNCTION increment_voter_count();
      END IF;
    END
    $$;
  `;

  try {
    await pool.query(queryText);
    console.log("Tables created successfully!");
  } catch (err) {
    console.error("Error creating tables:", err);
  }
};

// Test database connection
const testDBConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Database connected at:', res.rows[0].now);
  } catch (err) {
    console.error('Database connection error:', err);
  }
};

// Run the functions
(async () => {
  await testDBConnection();
  await createTables();
})();

export default pool;