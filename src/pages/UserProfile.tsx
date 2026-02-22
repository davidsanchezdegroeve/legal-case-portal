import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Building2, UploadCloud, Lock, Save, FileBadge } from 'lucide-react';

export default function UserProfile() {
    const { profile, updateProfile, session } = useAuth();

    // Form state
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [companyName, setCompanyName] = useState(profile?.company_name || '');

    // Password state
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Image state & previews
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || '');
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState(profile?.company_logo_url || '');

    const [isSaving, setIsSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const logoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setCompanyName(profile.company_name || '');
            if (!avatarFile) setAvatarPreview(profile.avatar_url || '');
            if (!logoFile) setLogoPreview(profile.company_logo_url || '');
        }
    }, [profile, avatarFile, logoFile]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'logo') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (type === 'avatar') {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        } else {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const uploadImage = async (file: File, pathPrefix: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${pathPrefix}_${Math.random()}.${fileExt}`;
        const filePath = `${session?.user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSuccessMessage('');
        setErrorMessage('');

        try {
            let userAvatarUrl = profile?.avatar_url;
            let userLogoUrl = profile?.company_logo_url;

            if (avatarFile) {
                userAvatarUrl = await uploadImage(avatarFile, 'avatar');
            }
            if (logoFile) {
                userLogoUrl = await uploadImage(logoFile, 'logo');
            }

            await updateProfile({
                full_name: fullName,
                company_name: companyName,
                avatar_url: userAvatarUrl,
                company_logo_url: userLogoUrl
            });

            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            setErrorMessage('Failed to update profile: ' + msg);
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            setErrorMessage('Password must be at least 6 characters');
            return;
        }

        setIsSaving(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) throw error;

            setSuccessMessage('Password updated successfully!');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            setErrorMessage('Failed to update password: ' + msg);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-text-main mb-2">User Profile</h1>
                <p className="text-text-muted">Manage your personal details, company branding, and security settings.</p>
            </header>

            {successMessage && (
                <div className="mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-2">
                    <FileBadge className="w-5 h-5" /> {successMessage}
                </div>
            )}

            {errorMessage && (
                <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl">
                    {errorMessage}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Column: Image Uploads */}
                <div className="md:col-span-1 space-y-6">
                    <div className="glass-panel p-6 rounded-2xl border border-slate-800">
                        <h3 className="text-lg font-semibold text-text-main mb-4">Profile Branding</h3>

                        {/* Avatar Upload */}
                        <div className="mb-6 aspect-square w-full relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                            <div className="absolute inset-0 bg-slate-800 rounded-full border-4 border-[#151822] shadow-2xl overflow-hidden flex items-center justify-center transition-all group-hover:border-blue-500">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-16 h-16 text-slate-600" />
                                )}
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <UploadCloud className="w-8 h-8 text-text-main mb-2" />
                                    <span className="text-xs font-semibold text-text-main">Upload Avatar</span>
                                </div>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={avatarInputRef}
                                onChange={(e) => handleImageChange(e, 'avatar')}
                            />
                        </div>

                        {/* Logo Upload */}
                        <div className="aspect-video w-full relative group cursor-pointer" onClick={() => logoInputRef.current?.click()}>
                            <div className="absolute inset-0 bg-slate-900 rounded-xl border-2 border-slate-800 overflow-hidden flex items-center justify-center transition-all group-hover:border-amber-500">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <Building2 className="w-8 h-8 text-slate-600 mb-2" />
                                        <span className="text-xs text-text-muted">Company Logo</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <UploadCloud className="w-6 h-6 text-text-main mb-1" />
                                    <span className="text-[10px] font-semibold text-text-main uppercase tracking-wider">Upload Logo</span>
                                </div>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={logoInputRef}
                                onChange={(e) => handleImageChange(e, 'logo')}
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Forms */}
                <div className="md:col-span-2 space-y-6">
                    {/* Personal Details */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-400" />
                            </div>
                            <h2 className="text-xl font-bold text-text-main">Personal Information</h2>
                        </div>

                        <form onSubmit={handleSaveProfile} className="space-y-5">
                            <div>
                                <label className="text-sm font-medium text-text-muted ml-1 block mb-1">Full Name</label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-bg-surface border border-slate-700 rounded-xl px-4 py-3 text-text-main placeholder:text-slate-600 focus:border-blue-500 outline-none transition-colors"
                                    placeholder="Enter your full name"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-text-muted ml-1 block mb-1">Company Name</label>
                                <div className="relative">
                                    <Building2 className="w-5 h-5 text-text-muted absolute left-4 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        className="w-full bg-bg-surface border border-slate-700 rounded-xl pl-12 pr-4 py-3 text-text-main placeholder:text-slate-600 focus:border-amber-500 outline-none transition-colors"
                                        placeholder="Enter your company name"
                                    />
                                </div>
                            </div>
                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-text-main px-6 py-2.5 rounded-xl font-medium transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50"
                                >
                                    <Save className="w-4 h-4" />
                                    {isSaving ? 'Saving Changes...' : 'Save Profile Details'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Security */}
                    <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-slate-800">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                <Lock className="w-5 h-5 text-emerald-400" />
                            </div>
                            <h2 className="text-xl font-bold text-text-main">Security & Password</h2>
                        </div>

                        <form onSubmit={handleUpdatePassword} className="space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="text-sm font-medium text-text-muted ml-1 block mb-1">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full bg-bg-surface border border-slate-700 rounded-xl px-4 py-3 text-text-main placeholder:text-slate-600 focus:border-emerald-500 outline-none transition-colors"
                                        placeholder="Must be at least 6 characters"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-text-muted ml-1 block mb-1">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full bg-bg-surface border border-slate-700 rounded-xl px-4 py-3 text-text-main placeholder:text-slate-600 focus:border-emerald-500 outline-none transition-colors"
                                        placeholder="Re-enter new password"
                                    />
                                </div>
                            </div>
                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSaving || !newPassword || !confirmPassword}
                                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-text-main border border-slate-700 hover:border-slate-600 px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
                                >
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
