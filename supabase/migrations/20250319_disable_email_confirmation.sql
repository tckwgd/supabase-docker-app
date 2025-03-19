-- Disable email confirmation requirement
UPDATE auth.config
SET enable_email_autoconfirm = true
WHERE id = 1;

-- Allow users to sign in even with unconfirmed email
UPDATE auth.config
SET enable_sign_in_with_email_needs_verification = false
WHERE id = 1;
