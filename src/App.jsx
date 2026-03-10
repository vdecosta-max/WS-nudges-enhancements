import { useState } from "react";

const systemicFindings = [
  { id: "two-pass", title: "Two-Pass Response Override", icon: "🔄",
    description: "Olive generates a detailed, substantive first response that is then overwritten by a shorter, qualification-focused second response. The first pass consistently delivers stronger, more specific answers.",
    evidence: "Observed in 6 of 13 tested interactions: Dutch oven, material comparison, Mauviel pricing, monogramming, Le Creuset collection, and WS Reserve.",
    recommendation: "Evaluate the moderation layer between generation and render. Consider A/B testing first-pass vs. second-pass responses with real users to validate impact on conversion and satisfaction.",
    enablesNudges: "Product recommendations, collection completion, loyalty awareness" },
  { id: "qualification", title: "Qualification-First Conversation Pattern", icon: "❓",
    description: "In ~10 of 13 tested scenarios, Olive asks clarifying questions before offering any concrete value. This is appropriate for genuinely ambiguous queries but creates friction for high-intent, specific queries where the customer has already provided sufficient context.",
    evidence: "Material comparison, Dutch oven, first-cook recipe, collection completion, and gift-sending queries all triggered qualification loops before providing value.",
    recommendation: "Implement intent-confidence scoring. High-signal queries should trigger answer-first responses. Reserve qualification loops for genuinely ambiguous requests.",
    enablesNudges: "Search-intent bridging, material guides, price confidence, recipe inspiration" },
  { id: "scope", title: "Knowledge Scope Expansion Needed", icon: "📚",
    description: "Olive's knowledge boundary covers products, recipes, and basic care content. Major WS service offerings — Events & Services (Skills Series, Book Tours), WS Reserve membership, and detailed Registry information — fall outside the agent's accessible scope.",
    evidence: "Events queries returned 'I don't have information' despite WS running 250+ store events. WS Reserve was accurately described in first-pass then denied in second-pass. Registry triggered human handoff without describing the service.",
    recommendation: "Expand knowledge grounding to include the full WS ecosystem: events calendar, Reserve program, registry features, credit card benefits, and cross-brand registry (Pottery Barn, West Elm).",
    enablesNudges: "Skills Series invitations, Reserve upgrade prompts, community/events, registry deepening" }
];

const stages = [
  { id: "awareness", label: "Awareness", icon: "👁", color: "#8B6914", nudges: [
    { title: "Seasonal Welcome & Localization", nudgeIcon: "🍂", testPrompt: "Observed on page load",
      img: { file: "Screenshot_2026-03-10_at_2_40_13_pm.png + Screenshot_2026-03-10_at_6_22_28_pm.png", desc: "1) Olive welcome message — generic, no seasonal awareness despite Easter-themed website. 2) When prompted about an Easter dinner party, Olive asks 3 clarifying questions before offering ideas." },
      currentState: "Olive's welcome message is static and not seasonally aware. It references 'this season's most-loved kitchen essentials' as a fixed phrase regardless of time of year. The website itself carries seasonal theming (Easter imagery in spring) but the agent does not reflect this. When directly prompted about seasonal content (e.g., 'Easter dinner party'), Olive falls into the qualification-first pattern with three clarifying questions before offering any inspiration.",
      opportunity: "Both seasonal and spatial layers are absent from the agent. The website knows it's Easter — the agent does not. No mention of nearby store events, local availability, or seasonal entertaining content. This is a significant missed connection between the site experience and the agent experience.",
      proposed: "Make the greeting genuinely seasonal and location-aware. Example: 'Welcome — Easter is April 5th! Planning a spring gathering? Here are our most popular Easter entertaining ideas. Your Palo Alto store also has a free spring class this Saturday.'",
      considerations: "Requires integration with the seasonal content calendar and geo-IP for store events. When customers prompt seasonally, the agent should lead with curated seasonal content (recipes, menus, tableware) rather than qualification questions.", twoPass: false },
    { title: "Search-Intent Recipe Bridge", nudgeIcon: "🍞", testPrompt: "best dutch oven for sourdough",
      img: { file: "Screenshot_2026-03-10_at_2_48_49_pm.png", desc: "Olive asks 3 clarifying questions instead of recommending a product" },
      currentState: "Olive responds with three clarifying questions (size, material, color) before offering any recommendation. No recipe content surfaced despite WS having an extensive recipe library.",
      opportunity: "The customer provided a clear use case (sourdough) which narrows the product set significantly. This signal is not leveraged. No connection to WS recipe content.",
      proposed: "Lead with a confident recommendation: 'For sourdough, our Le Creuset Signature 5½-Qt. is a baker's favorite — the heavy lid traps steam perfectly.' Pair with a WS test kitchen recipe.",
      considerations: "Confident recommendations require strong catalog RAG grounding. Requires: qualification-first pattern adjustment.", twoPass: false },
    { title: "Trending / Social Proof", nudgeIcon: "📊", testPrompt: "what are people buying this season?",
      img: { file: "Screenshot_2026-03-10_at_2_58_09_pm.png", desc: "Olive shows Christmas clearance items (snowman stopper, holiday cookie mold) in March near Easter" },
      currentState: "Olive surfaces a product carousel labeled 'seasonal favorites.' 'View All' opens a 200-result unfiltered search page.",
      opportunity: "Products were seasonally misaligned — Christmas clearance in March near Easter. No actual social proof data. The 'View All' link breaks the curated experience.",
      proposed: "Surface genuinely trending items with social proof: '2,400 home cooks upgraded their kitchens this week.' Ensure feed aligns with seasonal calendar. Limit to 4–6 curated items.",
      considerations: "Real-time trending data requires a purchase velocity feed. Consider a curated 'editor's picks' fallback. Social proof numbers must be accurate.", twoPass: false }
  ]},
  { id: "consideration", label: "Consideration", icon: "🤔", color: "#B45309", nudges: [
    { title: "Cookware Material Guide", nudgeIcon: "⚖️", testPrompt: "should I get stainless steel or cast iron cookware?",
      img: { file: "Screenshot_2026-03-10_at_3_38_16_pm.png", desc: "Olive asks clarifying questions instead of comparing materials" },
      currentState: "Olive deflects with clarifying questions rather than comparing the two materials the customer explicitly asked about.",
      opportunity: "The customer is asking for expertise — a direct comparison. The qualification loop puts the knowledge burden back on the person who came to the agent because they lack it.",
      proposed: "Lead with the comparison: 'Stainless excels at searing and deglazing; cast iron is best for even heat retention and goes oven-to-table.' Then narrow with a use-case question.",
      considerations: "Requires qualification-first pattern adjustment. The agent needs confidence in its product knowledge to lead with answers.", twoPass: false },
    { title: "Registry Prompt for Life-Event Signals", nudgeIcon: "💍", testPrompt: "I'm getting married this fall and need to set up my kitchen from scratch.",
      img: { file: "Screenshot_2026-03-10_at_3_41_42_pm.png", desc: "Olive immediately suggests handoff to human without providing any value first" },
      currentState: "Olive recognizes registry intent and correctly identifies the handoff to a human specialist. When pushed, Olive recovers and offers category guidance. The handoff instinct is appropriate.",
      opportunity: "The initial response provides zero value before the handoff. No mention of what the registry service includes, that it's free, or that it works across Pottery Barn and West Elm.",
      proposed: "Acknowledge the moment → provide a quick 'kitchen starter' framework → then offer the specialist. Surface the cross-brand registry feature as a differentiator.",
      considerations: "The handoff to a specialist is the right destination. The improvement is about earning the handoff by providing immediate value first. Requires knowledge scope expansion.", twoPass: false },
    { title: "Price-Confidence Reframe", nudgeIcon: "💳", testPrompt: "is Mauviel copper worth the price?",
      img: { file: "Screenshot_2026-03-10_at_3_46_02_pm.png", desc: "Second-pass asks clarifying questions; first-pass (overridden) justified the price well" },
      currentState: "Two-pass observed. First response built a strong value case (heat conductivity, durability, aesthetics). Second response overwrote it with generic qualification questions.",
      opportunity: "The first-pass was significantly better. The second pass treats the customer as if they haven't started their journey — when they're already looking at a $400+ saucepan.",
      proposed: "Serve the first-pass style value case. Add the WS Visa rewards angle: 'With the WS Visa, you'd earn 10% back — that's $45 on this piece alone.' Frame as generational investment.",
      considerations: "Clear example of the two-pass override degrading the experience. Credit card mentions need compliance review.", twoPass: true }
  ]},
  { id: "decision", label: "Decision", icon: "✅", color: "#166534", nudges: [
    { title: "Cart Recovery with Shipping Hook", nudgeIcon: "🛒", testPrompt: "System-triggered — not testable via chat",
      img: null,
      currentState: "Not currently observable in the chat agent. Cart abandonment may be handled via email or other channels.",
      opportunity: "The chat agent has no role in cart recovery. This is a high-value touchpoint where a proactive nudge could recover 10–15% of abandoned carts.",
      proposed: "When items sit in cart 20+ min: 'Your Le Creuset set is waiting. Complete your order now and enjoy free shipping — ships within 2 business days.'",
      considerations: "Requires cart-idle timer integration. Free shipping on cookware is already a WS policy — the nudge surfaces an existing benefit. Net-new capability.", twoPass: false },
    { title: "Personalization Encouragement", nudgeIcon: "✒️", testPrompt: "can I get something monogrammed?",
      img: { file: "Screenshot_2026-03-10_at_3_49_27_pm.png", desc: "Second-pass asks clarifying questions; first-pass listed specific monogrammable products" },
      currentState: "Two-pass. First response listed specific categories (towels, aprons, cutting boards) and framed monogramming for gifts. Second response stripped this to a generic question.",
      opportunity: "Neither response mentions delivery time, cost, font options, or return policy. No visual preview — the strongest nudge to commit to personalization.",
      proposed: "'Most customers go with a classic block font — adds 5–7 business days. Preview your initials here.' Surface the most popular monogrammable items as a carousel.",
      considerations: "Monogrammed items have near-zero return rates and higher perceived value. Requires two-pass adjustment.", twoPass: true },
    { title: "Gift Confidence at Checkout", nudgeIcon: "🎁", testPrompt: "I need a gift for someone who loves cooking",
      img: { file: "Screenshot_2026-03-10_at_3_51_08_pm.png", desc: "Olive asks 3 bullet-point questions before offering any suggestions" },
      currentState: "Olive asks three clarifying questions. More defensible here since the agent doesn't know the recipient's preferences.",
      opportunity: "No concrete suggestions alongside questions. No mention of WS gift services (wrapping, boxes, messaging). Budget — the most useful qualifier — is not asked.",
      proposed: "Lead with 'safe bet' gifts at price tiers (under $50, $50–150, $150+). Then offer to narrow. Always mention complimentary gift wrapping.",
      considerations: "Gift queries are one scenario where some qualification is reasonable. The improvement is offering value alongside the questions.", twoPass: false }
  ]},
  { id: "onboarding", label: "Post-Purchase", icon: "📦", color: "#7C3AED", nudges: [
    { title: "First-Cook Recipe Kit", nudgeIcon: "🍳", testPrompt: "I just bought an All-Clad skillet, what should I cook first?",
      img: { file: "Screenshot_2026-03-10_at_3_53_13_pm.png", desc: "Olive asks preference questions instead of recommending specific recipes" },
      currentState: "Olive congratulates warmly. Then asks three preference questions — burying decent recipe ideas inside qualification bullets instead of presenting them as recommendations.",
      opportunity: "The customer's mindset is excitement and exploration. They want inspiration, not an interview. No links to WS test kitchen recipes or Skills Series videos.",
      proposed: "Flip the structure: 'Here are 3 perfect first cooks for your All-Clad' → seared steak, one-pan chicken, frittata → link to WS recipes → 'which sounds good?'",
      considerations: "Requires qualification-first adjustment. Should pull from WS's recipe library rather than generating generic suggestions.", twoPass: false },
    { title: "Care & Maintenance Guide", nudgeIcon: "🧽", testPrompt: "how do I take care of my copper pots?",
      img: { file: "Screenshot_2026-03-10_at_3_56_08_pm.png", desc: "Olive delivers a strong, structured care guide — the best response observed across all testing" },
      currentState: "Olive's strongest response. Leads with the answer, structured clearly (care, cleaning, polishing, storage). Specific and practical. Likely grounded in a structured knowledge article.",
      opportunity: "No cross-sell for care items referenced. No link to a deeper WS care guide. No mention of what not to cook in unlined copper.",
      proposed: "Keep the strong format. Add: a link to WS copper polish as a product card, a 'bookmark this' link to the full guide, and a brief note about acidic foods.",
      considerations: "This response demonstrates what Olive can do with structured content. Worth investigating why this query triggers answer-first while others trigger qualification.", twoPass: false },
    { title: "Skills Series Class Invitation", nudgeIcon: "🔪", testPrompt: "do you have any cooking classes coming up around seattle?",
      img: { file: "Screenshot_2026-03-10_at_4_01_30_pm.png", desc: "Olive says it doesn't have info on cooking classes and redirects to 'local culinary schools'" },
      currentState: "Olive states it doesn't have information on cooking events. Redirects to 'local culinary schools or community centers' — sending the customer away from the brand.",
      opportunity: "WS runs events across 250+ stores. 'Events & Services' is in the site's main navigation. The agent is unaware of a major brand differentiator.",
      proposed: "At minimum, link to the Events & Services page. Ideally, surface upcoming events at the nearest store based on customer location.",
      considerations: "Knowledge scope gap, not a conversation design issue. The agent correctly says it doesn't know. The fix is ensuring it has access to this data.", twoPass: false }
  ]},
  { id: "retention", label: "Retention", icon: "🔄", color: "#1D4ED8", nudges: [
    { title: "Seasonal Re-Engagement", nudgeIcon: "☀️", testPrompt: "System-triggered — not testable via chat",
      img: null,
      currentState: "Not currently observable. Re-engagement may be handled via email rather than the chat agent.",
      opportunity: "The chat agent has no proactive role in re-engaging dormant customers approaching a major holiday.",
      proposed: "For returning customers absent 60+ days near a holiday: 'Grilling season is here. Your Lodge cast iron pairs perfectly with our new outdoor collection.'",
      considerations: "Requires purchase history access and session-gap detection. Must feel helpful, not surveillance-like. Net-new capability.", twoPass: false },
    { title: "Collection Completion Nudge", nudgeIcon: "🧩", testPrompt: "I have the Le Creuset Dutch oven and braiser, what else should I get?",
      img: { file: "Screenshot_2026-03-10_at_4_05_19_pm.png", desc: "Second-pass asks 'what are you looking to add?'; first-pass recommended 5 specific Le Creuset pieces" },
      currentState: "Strongest two-pass example. First response recommended 5 specific Le Creuset pieces with use cases — genuinely excellent. Second response replaced it with a generic qualification question.",
      opportunity: "The first-pass is close to ideal. Missing: product cards with prices, collection framing ('you're 2 pieces away'), and shipping/promotion mentions.",
      proposed: "Serve the first-pass style. Add: 'You're 2 pieces from a complete Le Creuset kitchen. The skillet and saucepan round out your set — both ship free.'",
      considerations: "Clearest case for recalibrating two-pass guardrails. The overridden response was better in every way. Collection psychology drives higher AOV.", twoPass: true },
    { title: "WS Reserve Upgrade Prompt", nudgeIcon: "⭐", testPrompt: "what is Williams Sonoma Reserve?",
      img: { file: "Screenshot_2026-03-10_at_4_06_51_pm.png", desc: "Second-pass says 'I don't have information'; first-pass accurately listed all Reserve benefits" },
      currentState: "Most concerning two-pass example. First response accurately listed Reserve benefits. Second response: 'I currently don't have information about Williams Sonoma Reserve.' The agent knew, then denied knowing.",
      opportunity: "A customer asking about the loyalty program signals high engagement. The agent should explain Reserve and proactively calculate savings based on purchase history.",
      proposed: "Serve the first-pass response. For authenticated users: 'Based on your purchases this year, you'd save over $120 with Reserve — plus free shipping on every eligible order.'",
      considerations: "Strongest evidence for the two-pass investigation. Requires both two-pass adjustment and knowledge scope expansion.", twoPass: true }
  ]},
  { id: "advocacy", label: "Advocacy", icon: "📣", color: "#BE185D", nudges: [
    { title: "Post-Milestone Review Request", nudgeIcon: "✍️", testPrompt: "System-triggered — not testable via chat",
      img: null,
      currentState: "Not currently observable. Review solicitation may be handled via email post-purchase.",
      opportunity: "The chat agent has no role in capturing reviews at moments of peak satisfaction.",
      proposed: "After 5th order or $1,500+ spend: 'Your Breville Smart Oven has helped 3,200 other cooks decide. Would you share a quick review?'",
      considerations: "Reviews from repeat customers are the most trusted. Requires purchase history and milestone tracking. Net-new capability.", twoPass: false },
    { title: "Gift-Giving Enablement", nudgeIcon: "🎀", testPrompt: "I already own the KitchenAid mixer, can I send one as a gift?",
      img: { file: "Screenshot_2026-03-10_at_4_10_13_pm.png", desc: "Second-pass asks for clarification; first-pass confirmed gift capability and began helping" },
      currentState: "Two-pass. First response confirmed gift capability. Second asked for clarification. Neither acknowledges the 'I already own one' signal.",
      opportunity: "Ownership is a massive advocacy signal completely ignored. No mention of models/exclusive colors, gift wrapping, or personal messaging.",
      proposed: "Acknowledge ownership: 'Great taste — you already know how good it is.' Show models/colors, offer wrapping with a note, make different-address shipping seamless.",
      considerations: "Gift recipients become new customers at zero acquisition cost. Requires two-pass adjustment and purchase history cross-reference.", twoPass: true },
    { title: "Community & Events Invitation", nudgeIcon: "👨‍🍳", testPrompt: "are there any cooking events I can join?",
      img: { file: "Screenshot_2026-03-10_at_4_12_11_pm.png", desc: "Olive says it doesn't have info on cooking events or classes" },
      currentState: "Same as Skills Series test — Olive says it doesn't have information on cooking events. Confirms the knowledge gap is consistent.",
      opportunity: "WS runs events across 250+ stores. This customer is actively seeking community engagement — and the agent sends them away.",
      proposed: "Acknowledge WS events and link to Events & Services page. Ideally surface upcoming events by location and match to purchase interests.",
      considerations: "Same knowledge scope gap. For advocacy-stage customers, exclusive event invitations could deepen the relationship significantly.", twoPass: false }
  ]}
];

const ImgPlaceholder = ({ info }) => {
  if (!info) return (
    <div style={{ background: "#F0EDE6", borderRadius: "8px", padding: "14px 16px", border: "1px dashed #C9C2B4", fontSize: "12px", color: "#8B8B8B", fontFamily: "sans-serif", textAlign: "center" }}>
      System-triggered nudge — no chat screenshot available
    </div>
  );

  const files = info.file.split(" + ").map(f => f.trim());
  const basePath = `${import.meta.env.BASE_URL}img/`;

  return (
    <div style={{ background: "#F0EDE6", borderRadius: "8px", padding: "14px 16px", fontFamily: "sans-serif" }}>
      <div style={{ fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: "#8B6914", fontWeight: 600, marginBottom: "10px" }}>Screenshot Evidence</div>
      <div style={{ display: "flex", gap: "10px" }}>
        {files.map((file, i) => (
          <img
            key={i}
            src={`${basePath}${file}`}
            alt={info.desc}
            style={{
              maxWidth: files.length > 1 ? "15%" : "30%",
              height: "auto",
              borderRadius: "6px",
              border: "1px solid #E5E0D8",
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: "12px", color: "#5A5A5A", lineHeight: 1.5, marginTop: "10px" }}>{info.desc}</div>
    </div>
  );
};

export default function WSNudgeAnalysis() {
  const [activeStage, setActiveStage] = useState(0);
  const [expandedNudge, setExpandedNudge] = useState(null);
  const [showSystemic, setShowSystemic] = useState(true);
  const stage = stages[activeStage];

  return (
    <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", background: "#FAF8F5", color: "#2C2C2C", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: "980px", margin: "0 auto", padding: "48px 24px" }}>
        <div style={{ marginBottom: "48px", borderBottom: "1px solid #E5E0D8", paddingBottom: "32px" }}>
          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", color: "#8B6914", marginBottom: "14px", fontWeight: 600 }}>Williams Sonoma — AI Agent Nudge Analysis</div>
          <h1 style={{ fontSize: "clamp(28px,5vw,44px)", fontWeight: 600, lineHeight: 1.1, margin: 0, color: "#1A1A1A" }}>
            Olive Agent: Current State <span style={{ color: stage.color, fontStyle: "italic" }}>&amp; Proposed Enhancements</span>
          </h1>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "14px", color: "#6B6B6B", marginTop: "14px", maxWidth: "680px", lineHeight: 1.7 }}>
            18 nudge opportunities across 6 customer journey stages. Each nudge includes the current experience, the opportunity, the proposed enhancement, and key considerations for the delivery team.
          </p>
        </div>

        {/* Systemic Findings */}
        <div style={{ marginBottom: "44px" }}>
          <button onClick={() => setShowSystemic(!showSystemic)} style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "17px", fontWeight: 600, color: "#1A1A1A", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", padding: 0, marginBottom: "16px" }}>
            <span style={{ fontSize: "14px", transition: "transform 0.3s", transform: showSystemic ? "rotate(180deg)" : "rotate(0)", display: "inline-block" }}>{"▾"}</span>
            Foundational Capabilities — Prerequisites for Nudge Patterns
          </button>
          {showSystemic && <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {systemicFindings.map(f => (
              <div key={f.id} style={{ background: "#FFF", borderRadius: "12px", border: "1px solid #E5E0D8", padding: "22px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                  <span style={{ fontSize: "22px" }}>{f.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: "16px" }}>{f.title}</span>
                </div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "13px", color: "#4A4A4A", lineHeight: 1.65, marginBottom: "10px" }}>{f.description}</div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px", color: "#6B6B6B", lineHeight: 1.6, marginBottom: "6px" }}>
                  <strong style={{ color: "#8B6914" }}>Evidence:</strong> {f.evidence}
                </div>
                <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12px", color: "#6B6B6B", lineHeight: 1.6, marginBottom: "6px" }}>
                  <strong style={{ color: "#166534" }}>Recommendation:</strong> {f.recommendation}
                </div>
                <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "10px", color: "#ABABAB", marginTop: "8px" }}>Enables: {f.enablesNudges}</div>
              </div>
            ))}
          </div>}
        </div>

        {/* Stage Tabs */}
        <div style={{ display: "flex", gap: "5px", marginBottom: "36px", overflowX: "auto", paddingBottom: "6px" }}>
          {stages.map((s, i) => (
            <button key={s.id} onClick={() => { setActiveStage(i); setExpandedNudge(null); }} style={{
              flex: "1 0 auto", minWidth: "110px", padding: "14px", borderRadius: "10px",
              border: i === activeStage ? `1.5px solid ${s.color}55` : "1.5px solid #E5E0D8",
              background: i === activeStage ? "#FFF" : "#FAF8F5", color: i === activeStage ? s.color : "#8B8B8B",
              cursor: "pointer", fontFamily: "'DM Sans',sans-serif", display: "flex", flexDirection: "column", alignItems: "center", gap: "5px",
              boxShadow: i === activeStage ? "0 2px 10px rgba(0,0,0,0.05)" : "none", transition: "all 0.3s"
            }}>
              <span style={{ fontSize: "18px" }}>{s.icon}</span>
              <span style={{ fontSize: "11px", fontWeight: 600 }}>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Nudge Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {stage.nudges.map((nudge, idx) => {
            const isExp = expandedNudge === idx;
            return (
              <div key={idx} style={{ borderRadius: "14px", border: isExp ? `1.5px solid ${stage.color}40` : "1.5px solid #E5E0D8", background: "#FFF", cursor: "pointer", overflow: "hidden", transition: "all 0.3s", boxShadow: isExp ? "0 4px 20px rgba(0,0,0,0.06)" : "0 1px 3px rgba(0,0,0,0.02)" }}>
                <div onClick={() => setExpandedNudge(isExp ? null : idx)} style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 10, fontSize: 24, flexShrink: 0, background: isExp ? `${stage.color}15` : "#F5F3EF", display: "flex", alignItems: "center", justifyContent: "center" }}>{nudge.nudgeIcon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, fontSize: "15px", color: "#1A1A1A" }}>{nudge.title}</span>
                      {nudge.twoPass && <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "9px", background: "#FEF3C7", color: "#92400E", padding: "2px 6px", borderRadius: "4px", fontWeight: 600 }}>TWO-PASS</span>}
                    </div>
                    <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: "11px", color: "#8B8B8B", marginTop: "4px" }}>Test: &ldquo;{nudge.testPrompt}&rdquo;</div>
                  </div>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: "#F5F3EF", fontSize: 13, color: "#8B8B8B", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "transform 0.3s", transform: isExp ? "rotate(180deg)" : "rotate(0)" }}>{"▾"}</div>
                </div>
                {isExp && (
                  <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <ImgPlaceholder info={nudge.img} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                      {[
                        { label: "Current Experience", content: nudge.currentState, color: "#64748B", icon: "📍" },
                        { label: "Opportunity", content: nudge.opportunity, color: "#B45309", icon: "💡" },
                        { label: "Proposed Enhancement", content: nudge.proposed, color: "#166534", icon: "🚀" },
                        { label: "Considerations", content: nudge.considerations, color: "#7C3AED", icon: "⚠️" },
                      ].map((col, ci) => (
                        <div key={ci} style={{ background: "#FDFCFA", borderRadius: 10, padding: "16px 18px", border: "1px solid #E5E0D8" }}>
                          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: col.color, marginBottom: "8px", fontWeight: 600 }}>{col.icon} {col.label}</div>
                          <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: "12.5px", color: "#4A4A4A", lineHeight: 1.65 }}>{col.content}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: "48px", textAlign: "center", fontFamily: "'DM Sans',sans-serif", fontSize: "11px", color: "#ABABAB" }}>
          18 nudge patterns · 6 journey stages · 3 foundational capabilities · Click cards to expand
        </div>
      </div>
    </div>
  );
}
