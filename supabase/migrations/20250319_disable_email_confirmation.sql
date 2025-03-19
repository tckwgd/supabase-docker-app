-- 查找适当的表来禁用电子邮件确认

-- 方法 1: 尝试更新 auth.config (在某些 Supabase 版本中存在)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'config') THEN
        -- 检查列是否存在并且不是生成列
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'auth' 
            AND table_name = 'config' 
            AND column_name = 'enable_email_autoconfirm'
            AND is_generated = 'NEVER'
        ) THEN
            UPDATE auth.config 
            SET enable_email_autoconfirm = true
            WHERE id = 1;
            RAISE NOTICE 'Updated enable_email_autoconfirm in auth.config table';
        END IF;

        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'auth' 
            AND table_name = 'config' 
            AND column_name = 'enable_sign_in_with_email_needs_verification'
            AND is_generated = 'NEVER'
        ) THEN
            UPDATE auth.config 
            SET enable_sign_in_with_email_needs_verification = false 
            WHERE id = 1;
            RAISE NOTICE 'Updated enable_sign_in_with_email_needs_verification in auth.config table';
        END IF;
    END IF;
END $$;

-- 方法 2: 尝试更新 auth.settings (可能在其他版本中存在)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'settings') THEN
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'auth' 
            AND table_name = 'settings' 
            AND column_name = 'require_email_confirmation'
            AND is_generated = 'NEVER'
        ) THEN
            UPDATE auth.settings 
            SET require_email_confirmation = false
            WHERE id = 1;
            RAISE NOTICE 'Updated auth.settings table';
        END IF;
    END IF;
END $$;

-- 方法 3: 尝试修改 auth.users 表中有关确认的列
DO $$
DECLARE
    _query text;
    _column_count int;
BEGIN
    -- 只检查 email_confirmed_at 列，避免 confirmed_at 生成列
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'auth' 
        AND table_name = 'users' 
        AND column_name = 'email_confirmed_at'
        AND is_generated = 'NEVER'
    ) THEN
        -- 首先检查是否有未确认的用户
        SELECT COUNT(*) INTO _column_count
        FROM auth.users
        WHERE email_confirmed_at IS NULL;

        RAISE NOTICE 'Found % users with null email_confirmed_at', _column_count;

        IF _column_count > 0 THEN
            UPDATE auth.users 
            SET email_confirmed_at = CURRENT_TIMESTAMP 
            WHERE email_confirmed_at IS NULL;
            RAISE NOTICE 'Updated % users in auth.users (email_confirmed_at)', _column_count;
        END IF;
    END IF;
    
    -- 检查并更新 is_confirmed 布尔字段
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'auth' 
        AND table_name = 'users' 
        AND column_name = 'is_confirmed'
        AND is_generated = 'NEVER'
    ) THEN
        SELECT COUNT(*) INTO _column_count
        FROM auth.users
        WHERE is_confirmed = false OR is_confirmed IS NULL;

        RAISE NOTICE 'Found % users with is_confirmed=false or null', _column_count;

        IF _column_count > 0 THEN
            UPDATE auth.users 
            SET is_confirmed = true 
            WHERE is_confirmed = false OR is_confirmed IS NULL;
            RAISE NOTICE 'Updated % users in auth.users (is_confirmed)', _column_count;
        END IF;
    END IF;
END $$;

-- 方法 4: 尝试在 auth.identities 表中更新邮箱验证状态 
DO $$
DECLARE
    _identity_count int;
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'identities') THEN
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'auth' 
            AND table_name = 'identities' 
            AND column_name = 'email_verified'
        ) THEN
            SELECT COUNT(*) INTO _identity_count
            FROM auth.identities
            WHERE provider_id = 'email'
            AND (email_verified = false OR email_verified IS NULL);
            
            RAISE NOTICE 'Found % email identities with email_verified=false or null', _identity_count;
            
            IF _identity_count > 0 THEN
                UPDATE auth.identities
                SET email_verified = true
                WHERE provider_id = 'email'
                AND (email_verified = false OR email_verified IS NULL);
                RAISE NOTICE 'Updated % identities in auth.identities', _identity_count;
            END IF;
        END IF;
    END IF;
END $$;

-- 方法 5: 查找并检查 auth.instances 表的设置
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'instances') THEN
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'auth' 
            AND table_name = 'instances' 
            AND column_name = 'email_confirm_required'
        ) THEN
            UPDATE auth.instances
            SET email_confirm_required = false;
            RAISE NOTICE 'Updated auth.instances (email_confirm_required)';
        END IF;
        
        IF EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_schema = 'auth' 
            AND table_name = 'instances' 
            AND column_name = 'enable_email_autoconfirm'
        ) THEN
            UPDATE auth.instances
            SET enable_email_autoconfirm = true;
            RAISE NOTICE 'Updated auth.instances (enable_email_autoconfirm)';
        END IF;
    END IF;
END $$;
