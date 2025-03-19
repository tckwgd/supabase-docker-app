-- 查找适当的表来禁用电子邮件确认

-- 方法 1: 尝试更新 auth.config (在某些 Supabase 版本中存在)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'config') THEN
        UPDATE auth.config 
        SET enable_email_autoconfirm = true,
            enable_sign_in_with_email_needs_verification = false 
        WHERE id = 1;
        RAISE NOTICE 'Updated auth.config table';
    END IF;
END $$;

-- 方法 2: 尝试更新 auth.settings (可能在其他版本中存在)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'auth' AND tablename = 'settings') THEN
        UPDATE auth.settings 
        SET require_email_confirmation = false
        WHERE id = 1;
        RAISE NOTICE 'Updated auth.settings table';
    END IF;
END $$;

-- 方法 3: 尝试更新 supabase_auth.config
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'supabase_auth' AND tablename = 'config') THEN
        UPDATE supabase_auth.config 
        SET enable_email_autoconfirm = true,
            email_confirm_required = false
        WHERE id = 1;
        RAISE NOTICE 'Updated supabase_auth.config table';
    END IF;
END $$;

-- 方法 4: 尝试直接使用函数来确认特定用户的电子邮件
-- 创建一个自定义函数来尝试确认所有未确认的电子邮件
CREATE OR REPLACE FUNCTION confirm_all_users()
RETURNS void AS $$
DECLARE
    _schema text;
    _table text;
    _query text;
BEGIN
    -- 检查各种可能的表名和模式
    FOR _schema, _table IN
        SELECT 'auth', 'users'
        UNION SELECT 'supabase_auth', 'users'
        UNION SELECT 'auth', 'accounts'
        UNION SELECT 'supabase_auth', 'accounts'
    LOOP
        IF EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = _schema 
            AND table_name = _table
        ) THEN
            -- 检查表中是否有 email_confirmed_at 字段
            IF EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = _schema 
                AND table_name = _table 
                AND column_name = 'email_confirmed_at'
            ) THEN
                _query := format('
                    UPDATE %I.%I 
                    SET email_confirmed_at = CURRENT_TIMESTAMP 
                    WHERE email_confirmed_at IS NULL
                ', _schema, _table);
                
                EXECUTE _query;
                RAISE NOTICE 'Updated % users in %.%', FOUND, _schema, _table;
            END IF;
            
            -- 检查表中是否有 confirmed_at 字段
            IF EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = _schema 
                AND table_name = _table 
                AND column_name = 'confirmed_at'
            ) THEN
                _query := format('
                    UPDATE %I.%I 
                    SET confirmed_at = CURRENT_TIMESTAMP 
                    WHERE confirmed_at IS NULL
                ', _schema, _table);
                
                EXECUTE _query;
                RAISE NOTICE 'Updated % users in %.%', FOUND, _schema, _table;
            END IF;
            
            -- 检查表中是否有 email_confirmed 布尔字段
            IF EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = _schema 
                AND table_name = _table 
                AND column_name = 'email_confirmed'
            ) THEN
                _query := format('
                    UPDATE %I.%I 
                    SET email_confirmed = true 
                    WHERE email_confirmed = false OR email_confirmed IS NULL
                ', _schema, _table);
                
                EXECUTE _query;
                RAISE NOTICE 'Updated % users in %.%', FOUND, _schema, _table;
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 执行函数确认所有用户
SELECT confirm_all_users();
