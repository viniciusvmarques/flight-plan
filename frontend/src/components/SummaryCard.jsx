import Card from "./Card";

export default function SummaryCard({ counts, onRefresh, loading }) {
    const { VFR = 0, MVFR = 0, IFR = 0, NO_DATA = 0, UNKNOWN = 0 } = counts || {};
    const total = VFR + MVFR + IFR + NO_DATA + UNKNOWN;

    return (
        <Card
            title="Resumo meteorológico"
            actions={
                <button type="button" className="secondary" onClick={onRefresh} disabled={loading} title="Buscar METAR/TAF de novo">
                    {loading ? "Atualizando..." : "Atualizar briefing"}
                </button>
            }
        >
            <div className="summary-card-shell">
                <p className="summary-card-copy">Leitura rápida do cenário meteorológico atual nas estações da rota.</p>

                <div className="summary-metrics">
                    <div className="summary-stat summary-stat--neutral">
                        <span className="summary-stat-label">Estações</span>
                        <strong className="summary-stat-value">{total}</strong>
                    </div>
                    <div className="summary-stat summary-stat--ok">
                        <span className="summary-stat-label">VFR</span>
                        <strong className="summary-stat-value">{VFR}</strong>
                    </div>
                    <div className="summary-stat summary-stat--warn">
                        <span className="summary-stat-label">MVFR</span>
                        <strong className="summary-stat-value">{MVFR}</strong>
                    </div>
                    <div className="summary-stat summary-stat--bad">
                        <span className="summary-stat-label">IFR</span>
                        <strong className="summary-stat-value">{IFR}</strong>
                    </div>
                    <div className="summary-stat summary-stat--neutral">
                        <span className="summary-stat-label">Sem dados</span>
                        <strong className="summary-stat-value">{NO_DATA + UNKNOWN}</strong>
                    </div>
                </div>
            </div>
        </Card>
    );
}
