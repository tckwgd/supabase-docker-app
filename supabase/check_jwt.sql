-- 检查并更新 JWT 密钥

-- 首先，尝试获取当前 JWT 密钥
DO $$
DECLARE
    jwt_secret text;
    current_setting_name text;
BEGIN
    -- 尝试各种可能的设置名称
    FOR current_setting_name IN
        SELECT 'pgsodium.jwt_secret'
        UNION SELECT 'auth.jwt_secret'
        UNION SELECT 'supabase_auth.jwt_secret'
        UNION SELECT 'pgcrypto.jwt_secret'
    LOOP
        BEGIN
            EXECUTE format('SHOW %I', current_setting_name) INTO jwt_secret;
            
            IF jwt_secret IS NOT NULL THEN
                RAISE NOTICE 'JWT 密钥在设置 % 中找到', current_setting_name;
                RAISE NOTICE '当前 JWT 密钥: %', jwt_secret;
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                -- 设置不存在，继续尝试下一个
                NULL;
        END;
    END LOOP;
END $$;

-- 尝试使用你提供的 JWT_SECRET 来设置值
DO $$
DECLARE
    new_jwt_secret text := 'Xe31/EiRkGVzoX+7JlcD0yU6NdVVLjplrqMK78q29es=';  -- 你提供的 JWT 密钥
    current_setting_name text;
    setting_exists boolean;
BEGIN
    -- 尝试各种可能的设置名称
    FOR current_setting_name IN
        SELECT 'pgsodium.jwt_secret'
        UNION SELECT 'auth.jwt_secret'
        UNION SELECT 'supabase_auth.jwt_secret'
        UNION SELECT 'pgcrypto.jwt_secret'
    LOOP
        BEGIN
            -- 检查设置是否存在
            EXECUTE format('SHOW %I', current_setting_name);
            setting_exists := true;
        EXCEPTION
            WHEN OTHERS THEN
                setting_exists := false;
        END;
        
        IF setting_exists THEN
            BEGIN
                -- 尝试更新设置
                EXECUTE format('ALTER SYSTEM SET %I = %L', current_setting_name, new_jwt_secret);
                RAISE NOTICE '已更新 % 设置为新的 JWT 密钥', current_setting_name;
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE '无法更新 % 设置: %', current_setting_name, SQLERRM;
            END;
        END IF;
    END LOOP;
    
    -- 通知如何应用更改
    RAISE NOTICE '如果已更新 JWT 密钥，你可能需要重启 PostgreSQL 才能使更改生效';
    RAISE NOTICE '使用 "SELECT pg_reload_conf();" 重新加载配置';
END $$;

-- 重新加载配置
DO $$
BEGIN
    PERFORM pg_reload_conf();
    RAISE NOTICE '已重新加载 PostgreSQL 配置';
END $$;
