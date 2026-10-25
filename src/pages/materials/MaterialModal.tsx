import React, { useState, useEffect } from 'react';
import type { Material, CreateMaterialPayload, UpdateMaterialPayload, MaterialType } from '../../types/material';
import { X, Save, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMaterialPayload | UpdateMaterialPayload) => Promise<void>;
  material?: Material | null;
  isLoading: boolean;
}

export const MaterialModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSubmit,
  material,
  isLoading,
}) => {
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [materialType, setMaterialType] = useState<MaterialType>('PLA');
  const [color, setColor] = useState('');
  const [colorHex, setColorHex] = useState('#FFFFFF');
  const [density, setDensity] = useState('1.24');
  const [diameter, setDiameter] = useState('1.75');
  const [printTempMin, setPrintTempMin] = useState('200');
  const [printTempMax, setPrintTempMax] = useState('220');
  const [bedTempMin, setBedTempMin] = useState('50');
  const [bedTempMax, setBedTempMax] = useState('60');
  const [unitCost, setUnitCost] = useState('250');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (material) {
      setSku(material.sku);
      setName(material.name);
      setMaterialType(material.materialType);
      setColor(material.color);
      setColorHex(material.colorHex || '#FFFFFF');
      setDensity(material.density?.toString() || '1.24');
      setDiameter(material.diameter?.toString() || '1.75');
      setPrintTempMin(material.printTempMin?.toString() || '200');
      setPrintTempMax(material.printTempMax?.toString() || '220');
      setBedTempMin(material.bedTempMin?.toString() || '50');
      setBedTempMax(material.bedTempMax?.toString() || '60');
      setUnitCost(material.unitCost?.toString() || '0');
      setDescription(material.description || '');
    } else {
      setSku('');
      setName('');
      setMaterialType('PLA');
      setColor('');
      setColorHex('#FFFFFF');
      setDensity('1.24');
      setDiameter('1.75');
      setPrintTempMin('200');
      setPrintTempMax('220');
      setBedTempMin('50');
      setBedTempMax('60');
      setUnitCost('250');
      setDescription('');
    }
    setError(null);
  }, [material, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!sku.trim()) {
      setError('SKU is required');
      return;
    }
    if (!name.trim()) {
      setError('Material name is required');
      return;
    }
    if (!color.trim()) {
      setError('Color is required');
      return;
    }

    try {
      const payload: CreateMaterialPayload = {
        sku: sku.trim(),
        name: name.trim(),
        materialType,
        color: color.trim(),
        colorHex,
        density: density ? parseFloat(density) : undefined,
        diameter: diameter ? parseFloat(diameter) : undefined,
        printTempMin: printTempMin ? parseInt(printTempMin, 10) : undefined,
        printTempMax: printTempMax ? parseInt(printTempMax, 10) : undefined,
        bedTempMin: bedTempMin ? parseInt(bedTempMin, 10) : undefined,
        bedTempMax: bedTempMax ? parseInt(bedTempMax, 10) : undefined,
        unitCost: parseFloat(unitCost) || 0,
        description: description.trim() || undefined,
      };

      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    }
  };

  return (
    <div className="modal-overlay" id="material-modal-overlay">
      <div className="modal-content" id="material-modal-card">
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {material ? 'Edit Material Specification' : 'Register New Material (F01)'}
          </h2>
          <button 
            type="button" 
            onClick={onClose}
            className="btn btn-secondary" 
            style={{ padding: '6px', borderRadius: '50%' }}
            id="btn-close-material-modal"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {error && (
            <div style={{ 
              padding: '12px 16px', 
              marginBottom: '16px', 
              borderRadius: 'var(--radius-md)', 
              background: 'var(--danger-bg)', 
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.85rem'
            }} id="material-form-error">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">SKU Code *</label>
              <input
                id="input-material-sku"
                type="text"
                className="form-control"
                placeholder="e.g. PLA-WHT-001"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Material Type *</label>
              <select
                id="select-material-type"
                className="form-control"
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value as MaterialType)}
                disabled={isLoading}
              >
                <option value="PLA">PLA (Polylactic Acid)</option>
                <option value="PETG">PETG</option>
                <option value="ABS">ABS</option>
                <option value="RESIN">Resin (SLA/DLP)</option>
                <option value="TPU">TPU (Flexible)</option>
                <option value="NYLON">Nylon (PA)</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Display Name *</label>
            <input
              id="input-material-name"
              type="text"
              className="form-control"
              placeholder="e.g. eSun PLA+ Cold White 1kg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Color Name *</label>
              <input
                id="input-material-color"
                type="text"
                className="form-control"
                placeholder="e.g. Cold White"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Color Swatch</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  id="input-material-color-hex"
                  type="color"
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  style={{ width: '42px', height: '42px', borderRadius: '8px', cursor: 'pointer', background: 'none', border: '1px solid var(--border-color)' }}
                  disabled={isLoading}
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{colorHex}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Density (g/cm³)</label>
              <input
                id="input-material-density"
                type="number"
                step="0.01"
                className="form-control"
                value={density}
                onChange={(e) => setDensity(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit Cost (VND / gram) *</label>
              <input
                id="input-material-unit-cost"
                type="number"
                step="1"
                className="form-control"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Nozzle Temp (°C)</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  id="input-material-temp-min"
                  type="number"
                  className="form-control"
                  placeholder="Min"
                  value={printTempMin}
                  onChange={(e) => setPrintTempMin(e.target.value)}
                  disabled={isLoading}
                />
                <span style={{ color: 'var(--text-muted)' }}>-</span>
                <input
                  id="input-material-temp-max"
                  type="number"
                  className="form-control"
                  placeholder="Max"
                  value={printTempMax}
                  onChange={(e) => setPrintTempMax(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Bed Temp (°C)</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  id="input-material-bed-min"
                  type="number"
                  className="form-control"
                  placeholder="Min"
                  value={bedTempMin}
                  onChange={(e) => setBedTempMin(e.target.value)}
                  disabled={isLoading}
                />
                <span style={{ color: 'var(--text-muted)' }}>-</span>
                <input
                  id="input-material-bed-max"
                  type="number"
                  className="form-control"
                  placeholder="Max"
                  value={bedTempMax}
                  onChange={(e) => setBedTempMax(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description & Slicing Notes</label>
            <textarea
              id="textarea-material-description"
              className="form-control"
              rows={3}
              placeholder="Recommended speeds, retraction settings, or storage notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button
              id="btn-cancel-material"
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              id="btn-save-material"
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              <Save size={16} />
              <span>{isLoading ? 'Saving...' : 'Save Material'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
