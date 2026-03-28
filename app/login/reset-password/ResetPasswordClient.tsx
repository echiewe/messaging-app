"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import LoginBackground from "../components/LoginBackground";

export default function ResetPasswordClient() {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const supabase = createClient();
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (password !== confirm) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.")
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setError(error.message);
            setLoading(false);
            return;
        }

        router.push("/messages"); // redirect after successful reset
    }

    return (
        <LoginBackground>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center">
                <h1 className="text-2xl">Set a new password</h1>

                <input
                    type="password"
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input"
                />
                <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="login-input"
                />

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button className='button' type="submit" disabled={loading}>
                    {loading ? "Updating..." : "Update password"}
                </button>
            </form>
        </LoginBackground>
    )
}