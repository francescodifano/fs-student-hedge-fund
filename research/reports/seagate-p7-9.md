<!-- Page image seagate-page-07.png (printed folio 5) — running header "4. TECHNOLOGICAL DEEP DIVE: THE HAMR REVOLUTION" -->

To prevent this, the magnetic medium must be made of a material with higher coercivity (magnetic "hardness"). But if the material is too hard, the recording head's magnetic field cannot be made strong enough to write the data. This "trilemma" (Readability, Writability, Stability) stalled industry density growth for nearly a decade.

### 4.2 The Mozaic 3+ Solution

Seagate's Mozaic 3+ platform solves this trilemma by introducing a fourth variable: Heat.

**The Plasmonic Writer:** The recording head integrates a nano-scale laser diode and a near-field transducer (NFT). The laser heats a tiny spot on the media to over 400°C for less than a nanosecond. This momentary heat lowers the coercivity of the media, allowing the magnetic head to write the bit. As it cools (instantly), the high coercivity returns, locking the data in.<sup>6</sup>

**Superlattice Media:** The platters are coated with a proprietary Iron-Platinum (FePt) alloy with a superlattice crystalline structure. This material is magnetically stable at extremely small grain sizes, enabling densities of **3TB per square inch** and beyond.<sup>6</sup>

**Spintronic Reader:** Reading these microscopic bits requires the world's most sensitive magnetic sensors. Seagate utilizes Gen 7 Spintronic readers, which leverage quantum tunneling magnetoresistance to detect the faint magnetic signals.<sup>7</sup>

### 4.3 Roadmap and Execution

Seagate is currently shipping 30TB+ drives based on the Mozaic 3+ platform in volume.<sup>7</sup> The roadmap visibility is robust:

**Table 2: Seagate HAMR Technology Roadmap**

| PLATFORM | CAPACITY RANGE | AREAL DENSITY | STATUS | ESTIMATED RAMP |
|---|---|---|---|---|
| MOZAIC 3+ | 30TB – 36TB | ~3TB / disk | Shipping Volume | Q3 FY2024 – Present |
| MOZAIC 4+ | 40TB – 46TB | ~4TB / disk | Qualification | Qualification 2H 2025 / Ramp 2026 |
| MOZAIC 5+ | 50TB+ | ~5TB / disk | Lab Demo | Est. 2028 |

**Mozaic 4+ (The Margin Kicker):** The transition to the 40TB generation (Mozaic 4+) is particularly significant. By moving to 4TB per platter, Seagate can achieve 40TB capacity on the same 10-platter chassis. This represents a 33% increase in capacity over the 30TB baseline with minimal increase in variable costs, providing a potent tailwind for gross margins in FY2027/28.<sup>9</sup>

### 4.4 Reliability and Yield

A critical concern for investors has been the reliability of integrating lasers into a spinning drive. Seagate has addressed this through extensive field testing. The company announced the shipment of over **1 million HAMR drives** by mid-2025, with field reliability metrics comparable to legacy PMR drives.<sup>11</sup> While yield challenges remain a risk for future generations (Mozaic 4+), the successful ramp of Mozaic 3+ serves as a strong proof of manufacturing viability.

<!-- Page image seagate-page-08.png (printed folio 6) -->

## 5. COMPETITIVE LANDSCAPE AND PEER ANALYSIS

***The competitive dynamic of the HDD industry has fundamentally altered. What was once a market share battleground is now a disciplined oligopoly.***

### 5.1 Western Digital (WDC): The Divergent Path

Following the completion of its spin-off of the Flash business in **February 2025**<sup>5</sup>, Western Digital's HDD business is operating as a focused entity. However, WDC has chosen a different technological path for the near term.

**The UltraSMR Strategy:** WDC is relying on **ePMR** (Energy-assisted PMR) combined with **UltraSMR** (advanced shingling) and **OptiNAND** (flash-assisted caching). To achieve 32TB capacities, WDC utilizes an **11-disk platform**.<sup>12</sup>

**The Cost Disadvantage:** An 11-disk drive requires more glass, more magnetic heads (22 vs 20), and more motor torque than Seagate's 10-disk HAMR drive. While WDC has guided for strong gross margins (approx. 44-45% for Q2 FY2026)<sup>13</sup>, we interpret this as a function of the current tight pricing environment rather than a structural cost leadership. As supply/demand normalizes, Seagate's lower BOM complexity should provide a superior margin floor.

**HAMR Laggard:** WDC has indicated it will qualify HAMR drives with a lead customer in **1H 2026**, with volume ramp expected in **2027**.<sup>14</sup> This places them approximately 18–24 months behind Seagate on the learning curve.

### 5.2 Toshiba: The Follower

Toshiba remains a distant third player (approx. 18% market share) with a roadmap focused on **MAMR** (Microwave-Assisted Magnetic Recording) and **MAS-MAMR**.

**Capacity Gap:** Toshiba's roadmap targets 40TB by 2027 using a 12-disk stacking technology.<sup>15</sup>

**Mechanical Risk:** The move to 11 and 12 disks introduces significant mechanical challenges (flutter, power consumption) and diminishes the "slot efficiency" value proposition for hyperscalers. Toshiba functions primarily as a second-source supplier to ensure supply chain redundancy for CSPs, rather than a technology leader.

### 5.3 Comparative Advantage Summary

**Table 3: Competitive Technology & Margin**

| METRIC | SEAGATE (STX) | WESTERN DIGITAL (WDC) | TOSHIBA |
|---|---|---|---|
| KEY TECH | HAMR (Mozaic 3+) | ePMR / UltraSMR | MAMR / FC-MAMR |
| 32TB ARCHITECTURE | 10 Platters (Density) | 11 Platters (Mechanical) | N/A (Trailing) |
| GROSS MARGIN TREND | ~40% (Structural) | ~38-44% (Cyclical/Mix) | ~25-30% (Est.) |
| HAMR VOLUME RAMP | Shipping Now | Est. 2027 | Est. 2027+ |
| STRATEGIC FOCUS | Profitability / Density | Cash Flow / Deleveraging | Volume Maintenance |

<!-- Page image seagate-page-09.png (printed folio 7) — running header "6. OPERATIONAL ANALYSIS AND UNIT ECONOMICS | 7. FINANCIAL ANALYSIS AND PROJECTIONS" -->

## 6. OPERATIONAL ANALYSIS AND UNIT ECONOMICS

### 6.1 The "Reset" of Gross Margins

***DRIVERS OF THE 40% MARGIN:***

**HAMR BOM Efficiency:** As detailed in Section 4, achieving 30TB+ with 10 disks reduces the cost-per-TB.

**Pricing Power:** The consolidation of the industry and the "build-to-order" discipline have allowed Seagate to pass through inflation and value-based pricing.

**Asset Utilization:** Factories are running at optimal utilization rates following the inventory corrections of 2023/2024, maximizing fixed cost absorption.

**Refurbishment & Circularity:** Seagate is increasingly engaging in drive refurbishment and material recycling (rare earth magnets), which provides a minor but growing margin accretive revenue stream.<sup>16</sup>

### 6.2 Supply Chain & Manufacturing Footprint

Seagate's manufacturing footprint is geographically diversified, providing resilience against geopolitical shocks.

**Wafer Fabs:** Derry, Northern Ireland (Heads); Bloomington, Minnesota (Heads/R&D).

**Media Manufacturing:** Fremont, California; Singapore.

**Assembly:** Thailand; Wuxi, China. This footprint allows Seagate to navigate tariff risks and supply chain disruptions. The company has actively managed its China exposure to ensure compliance with US export controls while maintaining access to the critical assembly capacity in Wuxi.

## 7. FINANCIAL ANALYSIS AND PROJECTIONS

### 7.1 Revenue Outlook

We project FY2026 revenue to reach **$10.8 billion**, representing growth of approximately **18% YoY**. This is underpinned by a 22% increase in nearline exabyte shipments, offset slightly by a 5% decline in legacy client compute revenue.

**Q1 FY2026 Performance:** Seagate reported revenue of **$2.63 billion**, up 21% YoY.<sup>1</sup> This strong start validates the demand recovery trajectory.

### 7.2 Profitability and Margins

We model Non-GAAP Gross Margins to sustain in the **39% – 41%** range through FY2027. While some quarterly fluctuation is expected due to product mix (e.g., initial ramps of new capacities often have lower initial yields), the structural floor has clearly lifted.

**Operating Margin:** We project operating margins to stabilize between **28% and 30%**. The operating leverage is significant; OpEx is expected to grow at less than half the rate of revenue.<sup>2</sup>

### 7.3 Tax Implications: OECD Pillar Two

A key variance in our model versus historical trends is the tax rate. Seagate has historically enjoyed tax holidays in Singapore and Thailand,