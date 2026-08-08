import React, { useState } from 'react';
import { DATA_TREATMENT_POINTS, DATA_TREATMENT_SUMMARY, CONSENT_VERSION } from '../../lib/consent';
import './DataConsent.css';

interface DataConsentProps {
  checked: boolean;
  onChange: (accepted: boolean) => void;
  /** Texto del titular, para diferenciar paciente de profesional. */
  audience?: 'patient' | 'psychologist';
  disabled?: boolean;
}

const DataConsent: React.FC<DataConsentProps> = ({
  checked,
  onChange,
  audience = 'patient',
  disabled = false,
}) => {
  const [expanded, setExpanded] = useState(false);

  const intro =
    audience === 'psychologist'
      ? 'Como profesional tratas datos sensibles de salud de tus pacientes. Necesitamos tu autorizacion para tratar tambien tus datos personales y los documentos que cargues.'
      : 'Para atenderte necesitamos tratar tus datos personales, incluidos datos de salud.';

  return (
    <div className="data-consent">
      <div className="data-consent__head">
        <svg className="data-consent__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
        <div>
          <p className="data-consent__title">Tratamiento de datos personales</p>
          <p className="data-consent__intro">{intro}</p>
        </div>
      </div>

      <ul className="data-consent__points">
        {DATA_TREATMENT_POINTS.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>

      <button
        type="button"
        className="data-consent__toggle"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        {expanded ? 'Ocultar texto completo' : 'Leer el texto completo'}
      </button>

      {expanded && (
        <p className="data-consent__full">
          {DATA_TREATMENT_SUMMARY}
          <span className="data-consent__version">Version {CONSENT_VERSION}</span>
        </p>
      )}

      <label className="data-consent__check">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span>
          He leido y <strong>autorizo</strong> el tratamiento de mis datos personales conforme a la
          Ley 1581 de 2012.
        </span>
      </label>
    </div>
  );
};

export default DataConsent;
