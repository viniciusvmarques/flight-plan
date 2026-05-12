import { useEffect, useMemo, useState } from "react";
import Card from "./Card";
import { createAircraftProfile, deleteAircraftProfile, fetchAircraftPresets, fetchAircraftProfiles, updateAircraftProfile } from "../services/aircraftService";
import { useNotify } from "../ui/NotifyContext.jsx";

const DATA_FIELDS = [
    { key: "usableFuelL", label: "Capacidade útil (L)", placeholder: "201" },
    { key: "tasKt", label: "TAS (kt)", placeholder: "122" },
    { key: "fuelFlowCruiseLph", label: "Fuel flow cruzeiro (L/h)", placeholder: "34" },
    { key: "taxiFuelL", label: "Táxi (L)", placeholder: "8" },
    { key: "climbTimeMin", label: "Subida (min)", placeholder: "14" },
    { key: "climbFuelL", label: "Combustível subida (L)", placeholder: "18" },
    { key: "descentTimeMin", label: "Descida (min)", placeholder: "10" },
    { key: "descentFuelL", label: "Combustível descida (L)", placeholder: "5" },
    { key: "approachFuelL", label: "Approach / landing (L)", placeholder: "4" },
    { key: "alternateFuelL", label: "Alternado (L)", placeholder: "24" },
    { key: "contingencyPct", label: "Contingência (%)", placeholder: "5" },
    { key: "finalReserveMin", label: "Reserva final (min)", placeholder: "45" },
    { key: "extraFuelL", label: "Extra fuel (L)", placeholder: "0" },
    { key: "defaultCruiseAltFt", label: "Altitude padrão (ft)", placeholder: "6500" },
    { key: "payloadKg", label: "Payload básico (kg)", placeholder: "300" },
    { key: "desiredLandingFuelL", label: "Desejado no pouso (L)", placeholder: "34" },
    { key: "reserveRule", label: "Regra de reserva", placeholder: "IFR 45 min" },
];

function blankForm(preset = null) {
    return {
        id: null,
        name: preset?.label || "",
        registration: "",
        presetKey: preset?.key || "",
        notes: preset?.description || "",
        isDefault: false,
        data: { ...(preset?.defaults || {}) },
    };
}

export default function AircraftProfilesManager() {
    const { toast, confirm } = useNotify();
    const [presets, setPresets] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(blankForm());

    const presetLookup = useMemo(() => Object.fromEntries(presets.map((item) => [item.key, item])), [presets]);

    async function refresh() {
        setLoading(true);
        const [presetItems, profileItems] = await Promise.allSettled([fetchAircraftPresets(), fetchAircraftProfiles()]);
        setPresets(presetItems.status === "fulfilled" ? presetItems.value : []);
        setProfiles(profileItems.status === "fulfilled" ? profileItems.value : []);
        setLoading(false);
    }

    useEffect(() => {
        refresh().catch(() => setLoading(false));
    }, []);

    function setDataField(key, value) {
        setForm((current) => ({
            ...current,
            data: { ...(current.data || {}), [key]: value },
        }));
    }

    function handlePresetChange(nextKey) {
        const preset = presetLookup[nextKey] || null;
        setForm((current) => ({
            ...current,
            presetKey: nextKey,
            name: current.id ? current.name : preset?.label || current.name,
            notes: current.id ? current.notes : preset?.description || current.notes,
            data: {
                ...(preset?.defaults || {}),
                ...(current.id ? current.data || {} : {}),
            },
        }));
    }

    function openProfile(profile) {
        setForm({
            id: profile.id,
            name: profile.name || "",
            registration: profile.registration || "",
            presetKey: profile.presetKey || "",
            notes: profile.notes || "",
            isDefault: !!profile.isDefault,
            data: { ...(profile.data || {}) },
        });
    }

    async function saveProfile() {
        if (!form.name.trim()) {
            toast("Informe um nome para o perfil da aeronave.", { variant: "warning", title: "Perfil" });
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: form.name,
                registration: form.registration,
                presetKey: form.presetKey || null,
                notes: form.notes,
                isDefault: form.isDefault,
                data: form.data || {},
            };

            if (form.id) {
                await updateAircraftProfile(form.id, payload);
                toast("Perfil de aeronave atualizado.", { variant: "success", title: "Aeronave" });
            } else {
                await createAircraftProfile(payload);
                toast("Perfil de aeronave criado.", { variant: "success", title: "Aeronave" });
            }

            await refresh();
            setForm(blankForm(presetLookup[form.presetKey] || null));
        } catch (e) {
            toast(e?.message || "Não foi possível salvar o perfil.", { variant: "error", title: "Erro" });
        } finally {
            setSaving(false);
        }
    }

    async function removeProfile(profile) {
        const ok = await confirm({
            title: "Remover perfil de aeronave",
            message: `Deseja remover o perfil "${profile.name}"?`,
            confirmLabel: "Remover",
            cancelLabel: "Cancelar",
            danger: true,
        });
        if (!ok) return;

        try {
            await deleteAircraftProfile(profile.id);
            toast("Perfil removido.", { variant: "success", title: "Aeronave" });
            await refresh();
            if (form.id === profile.id) setForm(blankForm());
        } catch (e) {
            toast(e?.message || "Não foi possível remover o perfil.", { variant: "error", title: "Erro" });
        }
    }

    return (
        <Card title={`Perfis de aeronave (${profiles.length})`}>
            <div className="info-stack aircraft-manager-shell">
                <p className="page-caption">
                    Crie perfis customizados com base nos presets de aviação geral pistão ou monte um perfil livre do zero.
                </p>

                <div className="page-chip-row">
                    {presets.map((preset) => (
                        <span key={preset.key} className="chip">
                            {preset.label}
                        </span>
                    ))}
                </div>

                <div className="aircraft-manager-grid">
                    <div className="aircraft-manager-column aircraft-manager-column--list">
                        <div className="aircraft-manager-section-head">
                            <span className="aircraft-manager-section-kicker">Perfis salvos</span>
                            <strong className="aircraft-manager-section-title">Biblioteca de aeronaves</strong>
                        </div>

                        {loading ? (
                            <div className="empty-note">Carregando presets e perfis...</div>
                        ) : profiles.length === 0 ? (
                            <div className="empty-note">Nenhum perfil salvo ainda. Use o formulário ao lado para criar o primeiro.</div>
                        ) : (
                            <div className="list-stack aircraft-profile-list">
                                {profiles.map((profile) => (
                                    <div key={profile.id} className="list-card-button aircraft-profile-card">
                                        <div className="page-chip-row">
                                            <span className="chip">{profile.registration ? `${profile.name} · ${profile.registration}` : profile.name}</span>
                                            {profile.isDefault ? <span className="chip ok">Padrão</span> : null}
                                            {profile.presetKey ? <span className="chip">{profile.presetKey}</span> : <span className="chip">Custom</span>}
                                        </div>
                                        <div className="list-card-meta">{profile.notes || "Sem observações adicionais."}</div>
                                        <div className="page-actions">
                                            <button className="secondary" type="button" onClick={() => openProfile(profile)}>
                                                Editar
                                            </button>
                                            <button className="secondary" type="button" onClick={() => removeProfile(profile)}>
                                                Remover
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="aircraft-manager-column aircraft-manager-column--form">
                        <div className="aircraft-manager-section-head">
                            <span className="aircraft-manager-section-kicker">Editor</span>
                            <strong className="aircraft-manager-section-title">{form.id ? "Atualizar perfil selecionado" : "Criar novo perfil"}</strong>
                        </div>

                        <div className="plan-grid plan-grid--2">
                            <label className="plan-field">
                                <span className="label">Preset base</span>
                                <select className="input" value={form.presetKey} onChange={(e) => handlePresetChange(e.target.value)}>
                                    <option value="">Perfil livre</option>
                                    {presets.map((preset) => (
                                        <option key={preset.key} value={preset.key}>
                                            {preset.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="plan-field">
                                <span className="label">Nome do perfil</span>
                                <input className="input" value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} placeholder="Ex.: C172 Clube" />
                            </label>
                        </div>

                        <div className="plan-grid plan-grid--3">
                            <label className="plan-field">
                                <span className="label">Matrícula</span>
                                <input
                                    className="input"
                                    value={form.registration}
                                    onChange={(e) => setForm((current) => ({ ...current, registration: e.target.value.toUpperCase() }))}
                                    placeholder="PT-ABC"
                                />
                            </label>
                            <label className="plan-field">
                                <span className="label">Perfil padrão</span>
                                <select className="input" value={form.isDefault ? "yes" : "no"} onChange={(e) => setForm((current) => ({ ...current, isDefault: e.target.value === "yes" }))}>
                                    <option value="no">Não</option>
                                    <option value="yes">Sim</option>
                                </select>
                            </label>
                            <label className="plan-field">
                                <span className="label">Observações</span>
                                <input className="input" value={form.notes} onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))} placeholder="Mistura rica, operação leve, capota fechada..." />
                            </label>
                        </div>

                        <div className="plan-grid plan-grid--3">
                            {DATA_FIELDS.map((field) => (
                                <label key={field.key} className="plan-field">
                                    <span className="label">{field.label}</span>
                                    <input
                                        className="input"
                                        value={form.data?.[field.key] ?? ""}
                                        onChange={(e) => setDataField(field.key, e.target.value)}
                                        placeholder={field.placeholder}
                                    />
                                </label>
                            ))}
                        </div>

                        <div className="page-actions">
                            <button className="primary profile-primary-action" type="button" onClick={saveProfile} disabled={saving}>
                                {saving ? "Salvando..." : form.id ? "Atualizar perfil" : "Criar perfil"}
                            </button>
                            <button className="secondary" type="button" onClick={() => setForm(blankForm())}>
                                Novo perfil
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
