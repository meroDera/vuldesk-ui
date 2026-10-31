# Outside design view: Codex (2026-10-31)

Model: gpt-6.1-sol via `codex exec` (model from ~/.codex/config.toml), reasoning effort medium.
Prompt: office-hours Visual Sketch step 6 text plus the context file (company, approved change,
constraints, DESIGN.md, market-scan summary, wireframe v4 HTML). Verbatim output below.
Note: the own-products row this view styles was removed after the cold-read (D10), so its
sections 1 and 4 and its first interaction idea no longer apply.

---

**Visual thesis:** Warm paper, firm ink, and three glimpses of working software—a calm, capable team with the energy of a well-set business letter.

Keep **“the set letter.”** Its plainness suits a buyer making a careful $7,500 decision. Make it feel like a poster through deliberate spacing, aligned edges, and a strong opening statement. Keep the existing type scale, light ground, and five blocks.

### Content plan: hero → support → detail → CTA

| Block | Role and composition |
|---|---|
| **Hero** | Lead with the existing promise at **34px/41px Source Serif 4**, then **17px/26px Source Sans 3** body copy. Give the 118-case example its existing **3px terracotta rule**. Email is the strongest action. |
| **Proof** | Lead with the clinic’s **20 months** of use. Place the three products beneath it as one editorial strip. The clinic proves staying power; the products show what the team can build. |
| **Prices** | Keep the ruled table. Use **22px serif amounts**, **16px/24px descriptions**, and **16px vertical cell padding**. Align amounts to the right; let “from” remain attached to $15,000. |
| **Questions** | Introduce Kushal and the team, then answer the buyer’s concerns. Keep ownership and data answers easy to find. |
| **Close** | Repeat the email action and one-business-day reply promise. No new pitch, badge, or competing offer. |

Use **720px of usable content width**, with **24px outer gutters** on desktop and **20px** on phones. Set section spacing to **56px desktop / 40px mobile**, with **1px #d8d2c8 rules** between blocks. Keep every section on **#faf8f4**.

### 1. Three screenshots: one composed strip

Use **three equal 224 × 168px images**, separated by **24px**, within the 720px measure. Align image tops and caption starts.

- **Order:** Dharke → VineHook → Wishverse. Lead with reading and finding changes—the closest match to Vuldesk’s offer—then move into the two video products.
- **Capture:** Export each crop at **896 × 672px**. Capture one meaningful part of the actual product, without browser tabs, desktop wallpaper, or empty margins.
- **Crop rule:** Preserve a complete useful unit: a market result, a script panel, or a finished-video preview. Never crop through the main result or distort a vertical video to fill the frame.
- **Colour:** Preserve each product’s real colours. No tint, greyscale treatment, or added terracotta inside the images.
- **Frame:** Square corners, no shadow, no browser mockup. Add a **1px #d8d2c8 edge only where a pale screenshot disappears into the paper**.
- **Caption:** **16px/23px**, **10px below** the image. Use the existing sentences, with the product name bold and underlined. Keep captions left-aligned.

Choose crops for recognisable shapes and visible output. At this size, screenshots demonstrate real software; the captions explain it. Essential information must remain outside the images.

### 2. Booking: an adjacent text choice

Place the booking link beside the email button as plain, underlined text:

**[Tell us about your pile →]** or book a 20-minute call

Use **16px #5a544c** for “or” and **16px #211c16** for the link, with a **20px gap** from the button. Give the link a **44px minimum hit height**, without a border or filled background. Put the written email address below, **8px** after the action row.

On phones, let booking wrap onto its own line with an **8px gap**. Do not shrink either action to force them together.

Show booking in the hero and close only when the real URL exists. Keep the header email-only. Use **#5a544c for visited text links** and the existing **3px #1a56db focus ring**, offset **3px**.

### 3. Team presence: words and work are enough

**Add no extra team graphic.** Anonymous silhouettes, stacked initials, and stock office images would introduce suggestion where the page currently offers facts.

Keep Kushal’s real photo at **112 × 112px**, with the existing **8px radius**. Crop to head and shoulders, eyes roughly **38% from the top**, with natural colour and no cutout treatment. Place the approved team sentence **18px beside it**, aligned near the top. On phones, use **80 × 80px** with a **16px gap**, keeping photo and sentence together.

The “we” voice, explicit team sentence, and three live products provide the company signal.

Also tighten the continuity answer. “The tool keeps running” goes beyond ownership. Replace that answer with:

> The tool and its accounts are yours. Everything it is built from is yours too.

### 4. Phone proof: three compact editorial rows

At **640px and below**, switch from three columns to three horizontal image-and-caption rows:

- Image: **112 × 84px**.
- Image-to-caption gap: **16px**.
- Space between rows: **24px**.
- Caption: **16px/23px**, using the full existing sentence.
- At viewport widths below **360px**, reduce images to **96 × 72px**.

Reuse the desktop crops. Let each row grow with its caption; never truncate text.

This keeps all three products visible in a compact sequence without three large stacked screenshots. Avoid a carousel: hidden proof and swipe discovery add work for this buyer.

### Two interactions that change the feel

1. **Make each product figure a single linked destination.** On hover or keyboard focus, strengthen the product-name underline from **1px to 2px** and outline the image in **#211c16**. No zoom or movement. Each figure gets one keyboard stop and a **3px blue focus outline** around the linked area.

2. **Use native question disclosures.** Keep “Who owns the tool?” open initially; start the other four closed. Use **17px bold summaries**, **48px minimum hit height**, and **14px vertical padding**, separated by the existing rules. Allow several answers to stay open. This gives the lower page a conversational rhythm and shortens the initial phone view without JavaScript. Count every answer toward the 450-word budget, including closed answers.

### Social card and system update

Set the social card at **1200 × 630px** on **#faf8f4**, with **80px side margins**, a **24px wordmark**, and the approved promise in **64px/70px Source Serif 4**. Use ink throughout and one **3px terracotta rule**. Leave screenshots off this asset; the promise should remain readable at thumbnail size.

Update DESIGN.md’s superseded “I” voice rule to the approved “we” voice. No broader system change is needed. Preserve the image dimensions, meaningful alt text, 16px text floor, and 450-word ceiling; add no new promotional copy.

Recommendation: Choose “The Set Letter, with Working Proof” because Vuldesk’s buyer needs clear prices, visible working tools, and confidence in a real team before sending an email.VERDICT: clean
FINDINGS: none
OUTSIDE_STATUS: completed provider=codex host=hermes
codex_voice_rc=0
