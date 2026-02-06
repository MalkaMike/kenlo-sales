# PDF Overlap Analysis - Page 1

## Identified Overlapping Sections:

### 1. IMOB Metrics Card (Lines 261-307)
- **Issue**: "12 Usuários", "8 fechamentos/mês", "250 Leads/mês", "IA SDR", "Whatsapp" are ALL overlapping on top of each other
- **Root cause**: yPos is incremented inside the card but then RESET at line 305: `yPos = metricsStartY + cardHeight + 10`
- **Fix needed**: The internal yPos tracking within the card is being discarded

### 2. LOC Metrics Card (Lines 309-357)
- **Issue**: "350 Contratos", "15 novos contratos", checkboxes for "Cobra Inquilino" and "Cobra Proprietário (Split) R$5,00" are overlapping
- **Root cause**: Same as IMOB - yPos is reset at line 356: `yPos = metricsStartY + cardHeight + 10`
- **Fix needed**: Internal yPos changes are being ignored

### 3. Investimento Section (Lines 501-621)
- **Issue**: Multiple lines overlapping:
  - "Licença pré-paga" overlaps with "Usuários adicionais pré-pagos"
  - "Total" overlaps with "Contratos adicionais pré-pagos"  
  - "Condições de Pagamento" overlaps with "Implantação"
  - "Equivalente mensal" overlaps
  - "Comparação com outras Frequências" section overlaps
  - "Mensal", "Semestral", "Bi-Annual" all overlap
  - "Estimativas Pós-pagos" overlaps

- **Root cause**: Line spacing in investment table is only 10px (line 531: `yPos + (i * 10)`)
- **Fix needed**: Need at least 12-14px between lines, and proper yPos increment after each subsection

## Solution Strategy:

1. **For Metrics Cards**: Don't reset yPos after cards - let it flow naturally
2. **For Investment Section**: Increase line spacing from 10px to 14px minimum
3. **Add explicit yPos increments** after each subsection instead of relying on loops
4. **Test after each section fix** to ensure no regression
