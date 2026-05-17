const BRL_MONTHLY = 19.9;

const PRICE_BY_LOCALE = {
    "pt-BR": { currency: "BRL", locale: "pt-BR", monthly: BRL_MONTHLY, suffix: "/mês", approximate: false },
    en: { currency: "USD", locale: "en-US", monthly: 3.99, suffix: "/mo", approximate: true },
    es: { currency: "USD", locale: "es-ES", monthly: 3.99, suffix: "/mes", approximate: true },
};

export function getLocalizedPrice(locale = "pt-BR") {
    const config = PRICE_BY_LOCALE[locale] || PRICE_BY_LOCALE["pt-BR"];
    const value = new Intl.NumberFormat(config.locale, {
        style: "currency",
        currency: config.currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(config.monthly);

    return {
        ...config,
        label: `${config.approximate ? "Approx. " : ""}${value}${config.suffix}`,
        brlLabel: new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 2,
        }).format(BRL_MONTHLY),
    };
}
