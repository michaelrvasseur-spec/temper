const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, LevelFormat, BorderStyle, WidthType,
  ShadingType, VerticalAlign
} = require('/usr/local/lib/node_modules_global/lib/node_modules/docx');
const fs = require('fs');

// === COLORS ===
const COPPER     = "C4733A";
const COPPER_LT  = "FDF4EC";
const CHARCOAL   = "1E1E1E";
const WARM_BG    = "FAF7F4";
const WARM_BORDER= "E5DDD5";
const WARM_MID   = "6B5E5A";
const GREEN_BG   = "D1FAE5";
const AMBER_BG   = "FEF3C7";
const RED_BG     = "FEE2E2";
const BLUE_BG    = "DBEAFE";
const WHITE      = "FFFFFF";

// === HELPERS ===
const border  = (c = WARM_BORDER) => ({ style: BorderStyle.SINGLE, size: 1, color: c });
const noBorder = () => ({ style: BorderStyle.NIL, size: 0, color: WHITE });
const allBorders  = (c = WARM_BORDER) => ({ top: border(c), bottom: border(c), left: border(c), right: border(c) });

function p(text, opts = {}) {
  return new Paragraph({
    alignment: opts.align || AlignmentType.LEFT,
    spacing: { before: opts.before ?? 80, after: opts.after ?? 80 },
    children: [new TextRun({
      text, size: opts.size ?? 22, bold: opts.bold ?? false,
      color: opts.color ?? CHARCOAL, font: "Arial", italics: opts.italic ?? false,
    })],
    ...(opts.numRef ? { numbering: { reference: opts.numRef, level: 0 } } : {}),
  });
}

function runs(parts, opts = {}) {
  return new Paragraph({
    alignment: opts.align || AlignmentType.LEFT,
    spacing: { before: opts.before ?? 80, after: opts.after ?? 80 },
    children: parts.map(pt => new TextRun({
      text: pt.text, bold: pt.bold ?? false, color: pt.color ?? CHARCOAL,
      size: pt.size ?? opts.size ?? 22, font: "Arial", italics: pt.italic ?? false,
    })),
    ...(opts.numRef ? { numbering: { reference: opts.numRef, level: 0 } } : {}),
  });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1, spacing: { before: 320, after: 120 },
    children: [new TextRun({ text, size: 32, bold: true, color: COPPER, font: "Arial" })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2, spacing: { before: 200, after: 100 },
    children: [new TextRun({ text, size: 26, bold: true, color: CHARCOAL, font: "Arial" })],
  });
}
function h3(text, color = CHARCOAL) {
  return new Paragraph({
    spacing: { before: 160, after: 60 },
    children: [new TextRun({ text, size: 22, bold: true, color, font: "Arial" })],
  });
}
function divider() {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: WARM_BORDER, space: 1 } },
    children: [],
  });
}

function activityTable(rows) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2400, 5400, 1560],
    rows: [
      new TableRow({ children: [
        new TableCell({ borders: allBorders(COPPER), width:{size:2400,type:WidthType.DXA}, shading:{fill:COPPER,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:"Bucket",size:20,bold:true,color:WHITE,font:"Arial"})]})] }),
        new TableCell({ borders: allBorders(COPPER), width:{size:5400,type:WidthType.DXA}, shading:{fill:COPPER,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:"What to do",size:20,bold:true,color:WHITE,font:"Arial"})]})] }),
        new TableCell({ borders: allBorders(COPPER), width:{size:1560,type:WidthType.DXA}, shading:{fill:COPPER,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:"Hrs/Wk",size:20,bold:true,color:WHITE,font:"Arial"})]})] }),
      ]}),
      ...rows.map(([bucket, what, hrs], idx) => new TableRow({ children: [
        new TableCell({ borders:allBorders(WARM_BORDER), width:{size:2400,type:WidthType.DXA}, shading:{fill:idx%2===0?WARM_BG:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:bucket,size:20,bold:true,color:CHARCOAL,font:"Arial"})]})] }),
        new TableCell({ borders:allBorders(WARM_BORDER), width:{size:5400,type:WidthType.DXA}, shading:{fill:idx%2===0?WARM_BG:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:what,size:20,color:CHARCOAL,font:"Arial"})]})] }),
        new TableCell({ borders:allBorders(WARM_BORDER), width:{size:1560,type:WidthType.DXA}, shading:{fill:idx%2===0?WARM_BG:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:hrs,size:20,bold:true,color:COPPER,font:"Arial"})]})] }),
      ]}))
    ]
  });
}

function scheduleTable(rows) {
  const CW = [2200, 1100, 1100, 1100, 1100, 1100, 1560];
  return new Table({
    width: { size: 9360, type: WidthType.DXA }, columnWidths: CW,
    rows: rows.map((row, i) => new TableRow({
      children: row.map((text, j) => {
        const isHeader = i === 0, isAct = j === 0;
        const bg = isHeader ? COPPER : isAct ? WARM_BG : WHITE;
        return new TableCell({
          borders: allBorders(WARM_BORDER),
          width: { size: CW[j], type: WidthType.DXA },
          shading: { fill: bg, type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 100, right: 100 },
          children: [new Paragraph({
            alignment: isHeader || !isAct ? AlignmentType.CENTER : AlignmentType.LEFT,
            children: [new TextRun({ text, size: 18, bold: isHeader || isAct, color: isHeader ? WHITE : CHARCOAL, font: "Arial" })],
          })],
        });
      })
    }))
  });
}

function checkpointBox(title, items, bg = GREEN_BG, borderColor = "16A34A") {
  const bs = { style: BorderStyle.SINGLE, size: 4, color: borderColor };
  return new Table({
    width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360],
    rows: [new TableRow({ children: [new TableCell({
      borders: { top: bs, bottom: bs, left: bs, right: bs },
      width: { size: 9360, type: WidthType.DXA },
      shading: { fill: bg, type: ShadingType.CLEAR },
      margins: { top: 140, bottom: 140, left: 200, right: 200 },
      children: [
        new Paragraph({ spacing:{after:80}, children:[new TextRun({text:title,size:22,bold:true,color:CHARCOAL,font:"Arial"})] }),
        ...items.map(item => new Paragraph({
          numbering: { reference: "checks", level: 0 },
          spacing: { after: 40 },
          children: [new TextRun({ text: item, size: 20, color: CHARCOAL, font: "Arial" })],
        })),
      ]
    })]})],
  });
}

function calloutBox(title, body, bg = BLUE_BG, borderColor = "3B82F6") {
  const bs = { style: BorderStyle.SINGLE, size: 4, color: borderColor };
  return new Table({
    width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360],
    rows: [new TableRow({ children: [new TableCell({
      borders: { top: bs, bottom: bs, left: bs, right: bs },
      width: { size: 9360, type: WidthType.DXA },
      shading: { fill: bg, type: ShadingType.CLEAR },
      margins: { top: 140, bottom: 140, left: 200, right: 200 },
      children: [
        new Paragraph({ spacing:{after:60}, children:[new TextRun({text:title,size:22,bold:true,color:CHARCOAL,font:"Arial"})] }),
        new Paragraph({ spacing:{after:0}, children:[new TextRun({text:body,size:20,color:CHARCOAL,font:"Arial",italics:true})] }),
      ]
    })]})],
  });
}

// ── DOCUMENT ────────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 560, hanging: 280 } } } }] },
      { reference: "checks",  levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u25A1", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 560, hanging: 280 } } } }] },
    ]
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1080, bottom: 1440, left: 1080 } } },
    children: [

      // ── TITLE ──────────────────────────────────────────────────────────────
      new Paragraph({ spacing:{before:480,after:60}, children:[new TextRun({text:"Temper",size:56,bold:true,color:COPPER,font:"Arial"})] }),
      new Paragraph({ spacing:{before:0,after:60}, children:[new TextRun({text:"18-Month Roadmap to Viability",size:32,color:CHARCOAL,font:"Arial"})] }),
      new Paragraph({ spacing:{before:0,after:80}, children:[new TextRun({text:"Raw ideas. Refined priorities.",size:22,italics:true,color:WARM_MID,font:"Arial"})] }),
      new Paragraph({ spacing:{before:0,after:240}, children:[new TextRun({text:"v2  \u2014  revised March 2026",size:18,color:WARM_MID,font:"Arial"})] }),
      divider(),

      p("This is a revised plan. The original v1 was built around two user-provided constraints — viability known by month 6, full-time ready by month 12. Those gates are preserved here as useful checkpoints, but the back half of the plan is extended to reflect a more realistic 18-month path to full-time income replacement for a solo founder learning to code while employed.", { before:160, after:80 }),
      p("Phase 3 has been substantially reworked after identifying two problems with the Wizard-of-Oz approach: the panel costs involved defeat the purpose of validating a cost-reduction product, and the founder's existing network skews toward enterprise rather than the SMB target market. The replacement methods are cheaper, better targeted, and more honest about what needs to be proven.", { before:40, after:80, italic:true, color:WARM_MID }),
      p("A new section on the bootstrapped vs. funded fork has been added after the viability checkpoint. Read it before month 7.", { before:40, after:240, italic:true, color:WARM_MID }),

      // ── OVERVIEW TABLE ─────────────────────────────────────────────────────
      h1("Phase Overview"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1400, 1200, 4360, 1700, 700],
        rows: [
          new TableRow({ children: [
            ...["Phase","Months","Goal","Primary Focus","Hrs/Wk"].map((t, j) => new TableCell({
              borders: allBorders(COPPER), width:{size:[1400,1200,4360,1700,700][j],type:WidthType.DXA},
              shading:{fill:COPPER,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100},
              children:[new Paragraph({alignment:j>1?AlignmentType.LEFT:AlignmentType.LEFT,children:[new TextRun({text:t,size:20,bold:true,color:WHITE,font:"Arial"})]})]
            }))
          ]}),
          ...[
            ["1 \u2014 Listen",    "1\u20132",  "Validate the problem is real before building anything else",                 "Discovery interviews",          "14"],
            ["2 \u2014 Focus",     "3\u20134",  "Narrow ICP; recruit 3\u20135 design partners from communities",             "Community + Odin Project",      "16"],
            ["3 \u2014 Validate",  "5\u20137",  "Prove the output changes decisions using low-cost methods",                  "Synthetic validation + output",  "14"],
            ["4 \u2014 Build",     "8\u201310", "Build a real MVP that runs MaxDiff end-to-end without manual facilitation",  "Coding",                        "16"],
            ["5 \u2014 Launch",    "11\u201314","Onboard first paying customers; refine on real usage",                       "Sales + polish",                "16"],
            ["6 \u2014 Decide",    "15\u201318","Make the full-time call with clear evidence",                                "Retrospective + planning",      "12"],
          ].map(([ph, mo, goal, focus, hrs], idx) => new TableRow({ children: [
            new TableCell({ borders:allBorders(WARM_BORDER), width:{size:1400,type:WidthType.DXA}, shading:{fill:idx%2===0?WARM_BG:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:ph,size:19,bold:true,color:COPPER,font:"Arial"})]})] }),
            new TableCell({ borders:allBorders(WARM_BORDER), width:{size:1200,type:WidthType.DXA}, shading:{fill:idx%2===0?WARM_BG:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:mo,size:19,color:CHARCOAL,font:"Arial"})]})] }),
            new TableCell({ borders:allBorders(WARM_BORDER), width:{size:4360,type:WidthType.DXA}, shading:{fill:idx%2===0?WARM_BG:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:goal,size:19,color:CHARCOAL,font:"Arial"})]})] }),
            new TableCell({ borders:allBorders(WARM_BORDER), width:{size:1700,type:WidthType.DXA}, shading:{fill:idx%2===0?WARM_BG:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({children:[new TextRun({text:focus,size:19,color:CHARCOAL,font:"Arial"})]})] }),
            new TableCell({ borders:allBorders(WARM_BORDER), width:{size:700,type:WidthType.DXA},  shading:{fill:idx%2===0?WARM_BG:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:100,right:100}, children:[new Paragraph({alignment:AlignmentType.CENTER,children:[new TextRun({text:hrs,size:19,bold:true,color:COPPER,font:"Arial"})]})] }),
          ]}))
        ]
      }),

      // ── PHASE 1 ────────────────────────────────────────────────────────────
      new Paragraph({ pageBreakBefore: true, children: [] }),
      h1("Phase 1 \u2014 Listen  (Months 1\u20132)"),
      runs([{text:"Goal: ",bold:true},{text:"Validate the problem is real before building another line of code."}], {before:60,after:120}),
      p("Your existing network skews enterprise. That is a constraint but not a blocker \u2014 enterprise contacts are useful as referral bridges. Ask them: \u201Cwho do you know running a scrappy product team where they\u2019re doing research without a dedicated researcher?\u201D You\u2019re not interviewing your enterprise contacts. You\u2019re asking them to route you to the right people.", {before:0,after:100,italic:true,color:WARM_MID}),
      p("Supplement with direct community access. Lenny\u2019s Slack, Mind the Product forums, and r/ProductManagement are full of exactly the PMs you\u2019re targeting. Observe first, ask questions later.", {before:0,after:160,italic:true,color:WARM_MID}),

      h3("Activities by bucket"),
      activityTable([
        ["Discovery interviews",  "12\u201318 interviews with SMB PMs. Use enterprise contacts for warm referrals, not as subjects. Target: solo PM at a Series A/B startup, no dedicated researcher, real backlog.", "5"],
        ["Community immersion",   "Join Lenny\u2019s community and Mind the Product Slack. Spend 30 min 3x/week reading and observing conversations about prioritization. Don\u2019t post yet \u2014 just listen.", "1.5"],
        ["The Odin Project",      "Foundations + HTML/CSS. Build a daily habit of 30\u201360 minutes rather than long weekend sessions.", "6"],
        ["Reading",               "Read The Mom Test first. One chapter per session, one written reflection per chapter. Don\u2019t move on until finished.", "1.5"],
      ]),
      h3("Weekly schedule \u2014 Phase 1"),
      scheduleTable([
        ["Activity",            "Mon",    "Tue",    "Wed",         "Thu",    "Fri",     "Sat/Sun"],
        ["The Odin Project",    "90 min", "",       "90 min",      "",       "",        "2\u20133 hrs"],
        ["Discovery interview", "",       "Prep",   "Interview",   "",       "Debrief", ""],
        ["Community watching",  "30 min", "",       "30 min",      "",       "30 min",  ""],
        ["Reading",             "",       "30 min", "",            "30 min", "",        "30 min"],
      ]),

      // ── PHASE 2 ────────────────────────────────────────────────────────────
      new Paragraph({ pageBreakBefore: true, children: [] }),
      h1("Phase 2 \u2014 Focus  (Months 3\u20134)"),
      runs([{text:"Goal: ",bold:true},{text:"Narrow your ICP and recruit 3\u20135 design partners, primarily through communities rather than warm contacts."}], {before:60,after:120}),
      p("By now you should have enough interview data to describe your ideal customer in one sentence. A design partner in this context is a PM who agrees to walk you through a real prioritization decision they\u2019re currently facing \u2014 not to use a product, but to explore whether your methodology produces something they\u2019d act on. They\u2019re co-investigators, not beta users.", {before:0,after:100,italic:true,color:WARM_MID}),
      p("Community contribution is the most efficient recruitment path at this stage. Answer prioritization questions in Lenny\u2019s or MTP with genuine expertise. When someone says \u201Cthis is exactly what I\u2019m dealing with,\u201D that\u2019s the person to DM.", {before:0,after:160,italic:true,color:WARM_MID}),

      h3("Activities by bucket"),
      activityTable([
        ["Community contribution",  "Move from observer to contributor. Answer 2\u20133 questions per week in PM communities on prioritization, research methodology, or stakeholder alignment. Build a reputation before asking for anything.", "2"],
        ["Design partner outreach",  "Reach back to strongest interview contacts and to community members who engaged with your posts. Ask for one 60-minute session on a real backlog decision they\u2019re currently facing. Aim for 3 yeses.", "3"],
        ["The Odin Project",         "JavaScript fundamentals. This is the hardest module. Protect coding sessions \u2014 don\u2019t sacrifice them to partner calls.", "8"],
        ["Prototype notes",          "Don\u2019t build. Every workflow gap you notice during partner conversations goes into a prioritized feature list.", "2"],
      ]),
      h3("Weekly schedule \u2014 Phase 2"),
      scheduleTable([
        ["Activity",              "Mon",    "Tue",    "Wed",          "Thu",    "Fri",       "Sat/Sun"],
        ["The Odin Project",      "90 min", "",       "90 min",       "90 min", "",          "3 hrs"],
        ["Community contribution","",       "20 min", "",             "",       "20 min",    ""],
        ["Design partner work",   "",       "Prep",   "Session/call", "",       "Notes",     ""],
        ["Prototype notes",       "",       "",       "",             "",       "30 min",    ""],
      ]),

      // ── PHASE 3 ────────────────────────────────────────────────────────────
      new Paragraph({ pageBreakBefore: true, children: [] }),
      h1("Phase 3 \u2014 Validate  (Months 5\u20137)"),
      runs([{text:"Goal: ",bold:true},{text:"Prove the output changes decisions, using low-cost methods that don\u2019t require running expensive real studies."}], {before:60,after:120}),
      p("This phase replaces the Wizard-of-Oz approach from the original plan. Two problems with that approach: (1) running a rigorous MaxDiff study costs $2\u20133K in panel fees, which defeats the purpose of validating a cost-reduction product; (2) your existing contacts are enterprise-scale, where the pain is less acute and the workflow is different.", {before:0,after:100,italic:true,color:WARM_MID}),
      p("The three methods below achieve the same validation goal \u2014 proving that the output is decision-relevant and that PMs would pay for it \u2014 without those costs.", {before:0,after:160,italic:true,color:WARM_MID}),

      h3("Method 1 \u2014 Output-only validation"),
      p("Build 2\u20133 realistic synthetic study outputs using the Temper prototype (results screen + feature map). These should look like a completed study on a recognisable SaaS product category. Recruit 10\u201315 PMs through communities for a 20-minute session framed as: \u201CI have a mock MaxDiff results report \u2014 I\u2019d love your reaction to whether this is useful for a real decision.\u201D", {before:40,after:80}),
      p("What you\u2019re testing: whether the output format is legible, whether the recommendation maps to how they actually make roadmap calls, and whether their instinct is \u201CI would have used this last week\u201D or \u201CI don\u2019t know what I\u2019d do with this.\u201D Zero panel cost. The prototype does the work.", {before:0,after:120,italic:true,color:WARM_MID}),

      h3("Method 2 \u2014 Internal stakeholder studies"),
      p("The expensive part of a real MaxDiff study is the external panel. A study using a PM\u2019s internal team \u2014 6\u201312 colleagues, stakeholders, or founders \u2014 as respondents costs nothing in panel fees. You build the survey in Google Forms or a free Qualtrics tier, collect responses, analyze manually in a spreadsheet, and present results using the Temper prototype as the report layer.", {before:40,after:80}),
      p("This tests a real workflow: does running the process produce something a PM would bring to a roadmap conversation? It also validates an underexplored positioning for Temper \u2014 internal alignment as a primary use case, not just customer research. If PMs find internal consensus harder than external insight, that\u2019s worth knowing now.", {before:0,after:120,italic:true,color:WARM_MID}),

      h3("Method 3 \u2014 Pricing signal through community"),
      p("After establishing a presence in PM communities, write a short post describing the problem Temper solves: \u201CHow do you currently decide which features to prioritize when everyone has an opinion?\u201D followed by a sketch of the solution. End with: \u201CI\u2019m building something in this space. If this resonates, I\u2019d love to show you.\u201D", {before:40,after:80}),
      p("When people respond, ask in the DM what they currently spend on research tooling or research ops. You\u2019re not pitching \u2014 you\u2019re establishing a baseline for willingness to pay before you name a price. This is the closest you can get to pricing signal without a product.", {before:0,after:120,italic:true,color:WARM_MID}),

      h3("Activities by bucket \u2014 Phase 3"),
      activityTable([
        ["Output validation sessions", "10\u201315 sessions showing synthetic study outputs to PMs. 20 minutes each. Document every reaction, especially confusion and excitement.", "4"],
        ["Internal stakeholder study",  "Run 1\u20132 studies with a willing design partner using their internal team as respondents. Manual analysis is fine \u2014 you\u2019re testing value, not scalability.", "4"],
        ["Community pricing conversations", "Contribute, invite DMs, then explore pricing context in 1:1 conversations. No pitch \u2014 just calibration.", "2"],
        ["The Odin Project",            "Advanced JavaScript and early React. This is what you\u2019ll need in Phase 4.", "5"],
      ]),
      h3("Weekly schedule \u2014 Phase 3"),
      scheduleTable([
        ["Activity",                 "Mon",    "Tue",    "Wed",          "Thu",    "Fri",     "Sat/Sun"],
        ["The Odin Project",         "90 min", "",       "90 min",       "",       "",        "2 hrs"],
        ["Output validation session","",       "Prep",   "Session",      "",       "Notes",   ""],
        ["Internal study work",      "",       "",       "",             "1 hr",   "1 hr",    "2 hrs"],
        ["Community + pricing",      "20 min", "",       "20 min",       "",       "20 min",  ""],
      ]),

      // ── 6-MONTH VIABILITY CHECK ────────────────────────────────────────────
      new Paragraph({ pageBreakBefore: true, children: [] }),
      h1("Viability Checkpoint  (End of Month 6\u20137)"),
      p("This checkpoint is intentionally between phases 3 and 4. You don\u2019t need to hit it at exactly month 6 \u2014 if your Phase 3 work is running a month behind, do more sessions before evaluating. The goal is a genuine signal read, not a deadline.", {before:60,after:160}),

      checkpointBox("Continue into Phase 4 if you can honestly say:", [
        "Talked to 20+ PMs about how they prioritize backlogs",
        "At least 5 described the core pain unprompted: \u201CI never really know what customers actually value most\u201D",
        "Output validation sessions produced \u201CI would have used this\u201D reactions more often than confusion",
        "At least one internal stakeholder study produced a result the PM said they\u2019d act on",
        "Community conversations suggest PMs spend $50\u2013200/month on adjacent tools (willingness to pay proxy)",
        "You still find the problem genuinely interesting",
      ], GREEN_BG, "16A34A"),
      new Paragraph({ spacing:{before:120,after:0}, children:[] }),
      checkpointBox("Do more discovery before building if:", [
        "Fewer than 12 output validation sessions completed \u2014 the data isn\u2019t there yet",
        "Reactions to outputs were politely positive but vague \u2014 no one said they\u2019d change a decision",
        "You can\u2019t yet name a specific type of PM and a specific workflow this fits",
      ], AMBER_BG, "D97706"),
      new Paragraph({ spacing:{before:120,after:0}, children:[] }),
      checkpointBox("Reconsider the idea if:", [
        "PMs say the problem is real but their current process (spreadsheet + gut) is good enough",
        "Every pricing conversation lands at zero \u2014 nobody thinks this is worth money",
        "You consistently can\u2019t find PMs who feel the pain acutely enough to spend 20 minutes on it",
      ], RED_BG, "DC2626"),

      // ── FORK: BOOTSTRAP VS FUNDED ─────────────────────────────────────────
      new Paragraph({ pageBreakBefore: true, children: [] }),
      h1("The Fork: Bootstrap or Funded?"),
      p("Before starting Phase 4, decide which game you\u2019re playing. The early phases are identical either way. From month 8 onward, they diverge significantly.", {before:60,after:160}),
      p("This isn\u2019t a permanent decision \u2014 many bootstrapped founders raise later. But optimizing for both simultaneously is one of the most common ways early-stage companies get stuck.", {before:0,after:160,italic:true,color:WARM_MID}),

      h3("Path A \u2014 Bootstrap"),
      p("The more natural fit for this product. Research tools for niche professional audiences are rarely venture-scale businesses, and that\u2019s fine \u2014 a $300\u2013500K/year SaaS business is a very good outcome and doesn\u2019t require external capital to get there. You maintain full control, grow at a pace that doesn\u2019t require hiring, and optimize for sustainability rather than speed.", {before:40,after:80}),
      p("The risk: slower growth means longer runway required before you can go full-time. The 18-month timeline in this plan assumes bootstrapping. Consider TinySeed or Calm Fund at $1\u20133K MRR if you want a small amount of capital without changing the fundamental approach.", {before:0,after:120}),

      h3("Path B \u2014 Raise pre-seed / accelerator"),
      p("Realistic but requires more than you currently have. YCombinator invests pre-revenue and your founder-market fit (UX researcher building a research tool) is a strong signal. The gaps: you\u2019re a solo founder still learning to code, which reads as execution risk. Investors want to see that the product can be built at speed.", {before:40,after:80}),
      p("If this path interests you, the right moment to pursue it is after Phase 3 \u2014 with design partner evidence, output validation data, and at least one signed letter of intent. That changes the conversation from \u201CI have an idea\u201D to \u201CI have proof of demand.\u201D Apply to YC for the batch that starts around month 10\u201312 on this timeline.", {before:0,after:80}),
      p("What it changes: you\u2019d need to find a technical co-founder, dedicate 2\u20133 months to fundraising (during which you build and talk to customers less), and accept that investors will set expectations about growth pace. If accepted to YC, you\u2019d likely leave your job immediately.", {before:0,after:80}),
      p("What it enables: quit your job earlier, hire a developer so your coding pace isn\u2019t the bottleneck, run some real studies using investment capital to prove the panel cost reduction thesis.", {before:0,after:120}),

      new Paragraph({ spacing:{before:120,after:0}, children:[] }),
      calloutBox(
        "The cleaner framing",
        "If your goal is a sustainable business you control that pays your salary \u2014 bootstrap. If your goal is to build the infrastructure layer for how product research gets done at scale across the market \u2014 raise. The early work is the same. The ambition level is what differs.",
        BLUE_BG, "3B82F6"
      ),

      // ── PHASE 4 ────────────────────────────────────────────────────────────
      new Paragraph({ pageBreakBefore: true, children: [] }),
      h1("Phase 4 \u2014 Build  (Months 8\u201310)"),
      runs([{text:"Goal: ",bold:true},{text:"Build an MVP that runs a real MaxDiff study end-to-end without manual facilitation."}], {before:60,after:120}),
      p("By this point you know enough JavaScript and React to start building something real, and building something real will accelerate your learning faster than continuing the curriculum. The core MVP is three things: a survey engine that generates and serves BIBD MaxDiff sets, a response collection mechanism, and a results dashboard. Everything else is secondary.", {before:0,after:160,italic:true,color:WARM_MID}),

      h3("Activities by bucket"),
      activityTable([
        ["Building MVP",          "Survey engine (MaxDiff BIBD + response collection), results dashboard, basic auth. React frontend + Node/Express + Supabase or SQLite. Ship something your design partners can actually use in month 8, even if rough.", "10"],
        ["The Odin Project",      "Wind down the structured curriculum and let real project work take over. Fill gaps (auth, databases, deployment) as you hit them in the build.", "4"],
        ["Customer conversations","Monthly 30-min check-in with each design partner. Show them what you\u2019ve built. Document every friction point.", "2"],
        ["Legal / admin (month 8 only)", "Read your employment contract carefully. If any clauses about IP or competing activities are ambiguous, a one-hour attorney consultation is worth the cost. Form an LLC before taking any money.", "1"],
      ]),
      h3("Weekly schedule \u2014 Phase 4"),
      scheduleTable([
        ["Activity",             "Mon",    "Tue",    "Wed",    "Thu",    "Fri",   "Sat/Sun"],
        ["Building MVP",         "90 min", "90 min", "",       "90 min", "",      "4\u20135 hrs"],
        ["The Odin Project",     "",       "",       "90 min", "",       "1 hr",  "1 hr"],
        ["Partner check-in",     "",       "bi-wkly","",       "",       "",      ""],
        ["Reading / reflection", "",       "",       "",       "",       "1 hr",  ""],
      ]),

      // ── PHASE 5 ────────────────────────────────────────────────────────────
      new Paragraph({ pageBreakBefore: true, children: [] }),
      h1("Phase 5 \u2014 Launch  (Months 11\u201314)"),
      runs([{text:"Goal: ",bold:true},{text:"Convert design partners to paying customers and add 2\u20133 more through warm referral."}], {before:60,after:120}),
      p("A wider window here is intentional. The first paying customer might come in month 11. It might come in month 13. The earlier v1 plan compressed this to 2 months, which would create pressure to discount aggressively or accept non-ideal customers just to hit a milestone. Don\u2019t.", {before:0,after:100,italic:true,color:WARM_MID}),
      p("Paying customers tell you something no interview or prototype reaction can: they believe the value exceeds the price. One paying customer is worth more signal than 50 positive interviews.", {before:0,after:160,italic:true,color:WARM_MID}),

      h3("Activities by bucket"),
      activityTable([
        ["Converting design partners", "Offer a founding-customer price (meaningful discount, permanent, clearly labeled as such). Ask each partner for one warm referral before offering the discount.", "4"],
        ["Product polish",            "Fix every friction point that comes up in real usage. Do not add new features until existing ones work reliably. Ship bug fixes fast.", "8"],
        ["Audience building",         "Your community posts should now include a light CTA: \u201CI\u2019m building something in this space \u2014 happy to show you.\u201D No cold outreach. Warm inbound only.", "2"],
        ["Metrics",                   "Track weekly: MRR, active users, studies run, churn. One dashboard, 15 minutes per week.", "1"],
      ]),

      // ── 12-MONTH CHECK ────────────────────────────────────────────────────
      new Paragraph({ pageBreakBefore: true, children: [] }),
      h1("12-Month Momentum Check"),
      p("Month 12 is not the full-time decision \u2014 that comes later. It\u2019s a momentum check. The question is not \u201Ccan I go full-time now?\u201D but \u201Cis this clearly heading somewhere?\u201D", {before:60,after:160}),

      checkpointBox("Strong momentum \u2014 stay the course:", [
        "At least 1 paying customer, even at a low founding price",
        "3+ design partners actively running studies (not just watching)",
        "Community presence is generating inbound conversations without you initiating them",
        "You\u2019re not bored \u2014 the product problems still feel interesting",
      ], GREEN_BG, "16A34A"),
      new Paragraph({ spacing:{before:120,after:0}, children:[] }),
      checkpointBox("Weak momentum \u2014 diagnose before continuing:", [
        "No paying customers after 11 months: is the pricing wrong, the product wrong, or the channel wrong?",
        "Design partners using it but not willing to pay: what specifically is missing?",
        "Building feels faster than learning: consider whether a technical co-founder changes the trajectory",
      ], AMBER_BG, "D97706"),

      // ── PHASE 6 ────────────────────────────────────────────────────────────
      new Paragraph({ pageBreakBefore: true, children: [] }),
      h1("Phase 6 \u2014 Decide  (Months 15\u201318)"),
      runs([{text:"Goal: ",bold:true},{text:"Make the full-time call with real evidence on both sides."}], {before:60,after:120}),
      p("This window is wider than v1 because 12 months was optimistic for a solo founder building from scratch while employed. Month 15\u201318 is when you should have enough revenue history and growth trajectory to make a genuine financial case for leaving your job.", {before:0,after:160,italic:true,color:WARM_MID}),

      h3("The financial framing"),
      p("The question isn\u2019t \u201Cis my MRR equal to my salary?\u201D It\u2019s \u201Cdo I have enough runway and enough trajectory that I can reach salary-replacement within 12 months of going full-time?\u201D That typically means $2,500\u20134,000 MRR with clear month-on-month growth, plus 6\u201312 months of personal savings runway.", {before:40,after:120}),

      checkpointBox("Go full-time if:", [
        "$2,500\u20134,000+ MRR with consistent month-on-month growth",
        "10+ active users running real studies (not just accounts)",
        "You can articulate why growth will accelerate full-time \u2014 specific channels, specific blockers",
        "Employment contract reviewed; no unresolved IP or non-compete concerns",
        "6\u201312 months of personal financial runway without salary",
        "You still wake up wanting to work on this",
      ], GREEN_BG, "16A34A"),
      new Paragraph({ spacing:{before:120,after:0}, children:[] }),
      checkpointBox("Set a firm date 3\u20136 months out and keep building if:", [
        "Revenue is real, growing, but below the threshold \u2014 write down a specific number and a specific date",
        "You\u2019ve identified 2\u20133 specific things that going full-time would unlock",
        "Savings runway exists but is shorter than ideal \u2014 build it before leaving",
      ], AMBER_BG, "D97706"),
      new Paragraph({ spacing:{before:120,after:0}, children:[] }),
      checkpointBox("Park the idea and bank the learning if:", [
        "No paying customers after 14 months of genuine effort",
        "MRR exists but has been flat for 3+ consecutive months with no clear explanation",
        "You\u2019ve genuinely lost curiosity about the problem",
      ], RED_BG, "DC2626"),

      // ── READING LIST ──────────────────────────────────────────────────────
      new Paragraph({ pageBreakBefore: true, children: [] }),
      h1("Reading List"),
      p("Sequenced for where you\u2019ll be in each phase. The order matters.", {before:60,after:160}),

      new Table({
        width: { size: 9360, type: WidthType.DXA }, columnWidths: [1200, 3600, 3000, 1560],
        rows: [
          new TableRow({ children: [
            ...["When","Book","Why it matters","Author"].map((t, j) => new TableCell({
              borders: allBorders(COPPER), width:{size:[1200,3600,3000,1560][j],type:WidthType.DXA},
              shading:{fill:COPPER,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120},
              children:[new Paragraph({children:[new TextRun({text:t,size:20,bold:true,color:WHITE,font:"Arial"})]})]
            }))
          ]}),
          ...[
            ["Now",      "The Mom Test",                 "Teaches you to run discovery interviews that generate honest signal, not polite noise.",                                  "Rob Fitzpatrick"],
            ["Month 2",  "Continuous Discovery Habits",  "Built for exactly your context: a researcher making fast product decisions without dedicated infrastructure.",             "Teresa Torres"],
            ["Month 4",  "Zero to Sold",                 "A bootstrapper\u2019s guide from idea to revenue. Written for solo founders building without VC.",                        "Arvid Kahl"],
            ["Month 6",  "Obviously Awesome",            "Positioning. When you need to explain what Temper is and who it\u2019s for in one sentence, this is the framework.",      "April Dunford"],
            ["Month 8",  "Competing Against Luck",       "Jobs-to-be-done. Helps you understand what PMs are actually hiring Temper to do \u2014 not what you think they\u2019re hiring it for.", "Clayton Christensen"],
            ["Month 12", "The SaaS Playbook",            "Practical guidance on SaaS pricing, growth levers, and unit economics for bootstrapped founders.",                       "Rob Walling"],
          ].map(([when, book, why, author], idx) => new TableRow({ children: [
            new TableCell({ borders:allBorders(WARM_BORDER), width:{size:1200,type:WidthType.DXA}, shading:{fill:idx%2===0?WARM_BG:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:when,size:19,bold:true,color:COPPER,font:"Arial"})]})] }),
            new TableCell({ borders:allBorders(WARM_BORDER), width:{size:3600,type:WidthType.DXA}, shading:{fill:idx%2===0?WARM_BG:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:book,size:19,bold:true,color:CHARCOAL,font:"Arial"})]})] }),
            new TableCell({ borders:allBorders(WARM_BORDER), width:{size:3000,type:WidthType.DXA}, shading:{fill:idx%2===0?WARM_BG:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:why,size:19,color:CHARCOAL,font:"Arial"})]})] }),
            new TableCell({ borders:allBorders(WARM_BORDER), width:{size:1560,type:WidthType.DXA}, shading:{fill:idx%2===0?WARM_BG:WHITE,type:ShadingType.CLEAR}, margins:{top:80,bottom:80,left:120,right:120}, children:[new Paragraph({children:[new TextRun({text:author,size:19,italics:true,color:WARM_MID,font:"Arial"})]})] }),
          ]}))
        ]
      }),

      // ── BEFORE MONTH 1 ────────────────────────────────────────────────────
      new Paragraph({ pageBreakBefore: true, children: [] }),
      h1("Before Month 1 \u2014 Do These First"),

      h3("Review your employment contract", COPPER),
      p("Read your agreement for IP assignment clauses (who owns work created outside employment), non-compete and non-solicitation language, and any clauses about competitive activities. You are a UX researcher building a research tool \u2014 make sure this is clearly distinguishable from your employer\u2019s business. One hour with an employment attorney is worth it if anything is ambiguous.", {before:40,after:120}),

      h3("Build a research log system", COPPER),
      p("One document per interview. One master synthesis document. One running \u201Cquotes that matter\u201D list. Notion or Obsidian both work. Set this up before your first conversation \u2014 you\u2019ll thank yourself in month 4 when you\u2019re trying to reconstruct what 20 PMs told you.", {before:40,after:120}),

      h3("Schedule your first three interviews", COPPER),
      p("Don\u2019t wait for the right moment. Put three names in your calendar before you close this document. Former colleagues who can route you to startup PMs. LinkedIn contacts at smaller companies. The first three are practice \u2014 not perfect data.", {before:40,after:120}),

      h3("Join two communities", COPPER),
      p("Lenny\u2019s Newsletter community (paid but worth it for access to the Slack) and the Mind the Product Slack (free). Spend the first two weeks reading only. Observe which conversations come up repeatedly around prioritization and roadmap decisions. That pattern is your discovery interview guide.", {before:40,after:120}),

      h3("Create a minimal waitlist page", COPPER),
      p("A single page: headline, two sentences about the problem, email field. This forces you to articulate the value proposition in plain language and gives you a place to send people who say \u201Clet me know when it\u2019s ready.\u201D Carrd.co takes 30 minutes. Do it this week.", {before:40,after:120}),

      h3("A note on the Odin Project timeline", COPPER),
      p("A realistic target: Foundations by end of month 2, HTML/CSS by month 4, JavaScript by month 7, React by month 9. You don\u2019t need to finish the curriculum before building \u2014 once you know enough JavaScript to be dangerous, the real project will teach you faster. Track a weekly minimum, not a daily one. Consistency over intensity.", {before:40,after:240}),

      divider(),
      new Paragraph({ spacing:{before:160,after:80}, alignment:AlignmentType.CENTER, children:[new TextRun({text:"Temper  \u2014  Raw ideas. Refined priorities.",size:20,italics:true,color:WARM_MID,font:"Arial"})] }),
      new Paragraph({ spacing:{before:0,after:0}, alignment:AlignmentType.CENTER, children:[new TextRun({text:"Roadmap v2  |  March 2026",size:18,color:WARM_MID,font:"Arial"})] }),
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('/sessions/exciting-happy-hamilton/mnt/outputs/temper-12-month-roadmap.docx', buffer);
  console.log('Done.');
});
