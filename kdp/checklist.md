# KDP Publishing Guide — The Pivot Pyramid

> Step-by-step walkthrough for publishing on Amazon KDP.
> Check off each item as you complete it.

---

## Phase 1: Account Setup

- [ ] Sign in to [kdp.amazon.com](https://kdp.amazon.com) with selcuk.atli@gmail.com
- [ ] Complete **tax interview** (W-9 for U.S. residents)
	- Navigate: KDP Dashboard → Tax Information
	- Have SSN or EIN ready
- [ ] Set up **bank account** for royalty payments
	- Navigate: KDP Dashboard → Payment Settings
	- Add U.S. bank account (routing + account number)
- [ ] Verify your **identity** if prompted (may require ID upload)

---

## Phase 2: Review Manuscript Before Upload

- [x] Markdown source fact-checked (34 corrections applied, 81 case studies audited)
- [x] EPUB generated with 20 figures embedded (46MB)
- [x] DOCX generated with 20 figures embedded (46MB)
- [ ] Download **Kindle Previewer** from [amazon.com/kindleformat/kindlepreviewer](https://www.amazon.com/kindleformat/kindlepreviewer)
- [ ] Open `kdp/manuscript/pivot-pyramid.epub` in Kindle Previewer
- [ ] Check these items in previewer:
	- [ ] Table of contents links work (tap each chapter)
	- [ ] Chapter breaks render correctly
	- [ ] All 20 figures display properly
	- [ ] Tables are readable (may need reflowing)
	- [ ] Author photo appears in About the Author section
	- [ ] No broken formatting, orphaned headers, or cut-off text
	- [ ] Test on different device sizes (phone, tablet, Kindle)
- [ ] Fix any issues found → regenerate EPUB → re-check

---

## Phase 3: Create Ebook Listing

Go to: **KDP Dashboard → Create New Title → Kindle eBook**

### 3a. Book Details

| Field | Value |
|-------|-------|
| Language | English |
| Title | The Pivot Pyramid |
| Subtitle | A Founder's Complete Guide to Strategic Startup Experimentation |
| Series | *(leave blank)* |
| Edition | 1 |
| Author | Selçuk Atlı |
| Description | Copy from `kdp/metadata.md` → Description section (4,000 char max) |
| Publishing rights | I own the copyright |
| Keywords | See below |
| Categories | See below |
| Age range | Not applicable |

**Keywords** (enter each as a separate phrase):
1. startup pivot strategy framework
2. lean startup experimentation guide
3. product market fit methodology
4. startup founder decision making
5. when to pivot your startup
6. entrepreneurship framework book
7. build measure learn startup

**Categories** (select two):
- Business & Money → Entrepreneurship → Startup
- Business & Money → Management & Leadership → Decision-Making & Problem Solving

- [ ] All book details entered
- [ ] Click **Save and Continue**

### 3b. Content

- [ ] Upload manuscript: `kdp/manuscript/pivot-pyramid.epub`
	- KDP will process and show a preview
- [ ] Enable **KDP spell check** (optional — may flag proper nouns)
- [ ] Upload front cover: `kdp/covers/front-cover-1600x2866.png`
	- Select "Upload a cover you already have"
	- Must be at least 1600x2560px (ours is 1600x2866 — good)
- [ ] Click **Launch Previewer** to verify one more time
- [ ] Click **Save and Continue**

### 3c. Pricing & Distribution

| Setting | Recommended Value |
|---------|-------------------|
| KDP Select | **Decide:** Yes = Kindle Unlimited + higher royalty, but Amazon-exclusive for 90 days. No = sell everywhere (Apple Books, Kobo, etc.) immediately. |
| Territories | All territories (Worldwide) |
| Royalty plan | 70% (available for $2.99-$9.99) |
| List price | **$9.99 USD** |
| DRM | **No** (recommended — no evidence it prevents piracy, may hurt discoverability) |

> **KDP Select decision:** If you want Kindle Unlimited readers (significant discovery boost), enroll for the first 90 days. You can opt out later. If you want to immediately list on Apple Books, Kobo, Google Play — skip KDP Select.

- [ ] Pricing and distribution configured
- [ ] Click **Publish Your Kindle eBook**

### Ebook goes live in 24-72 hours.

---

## Phase 4: Create Paperback Listing (Optional)

Go to: **KDP Dashboard → Your published ebook → Create Paperback**

### 4a. Paperback Details

| Field | Value |
|-------|-------|
| ISBN | Let KDP assign a free one, or enter your own |
| Publication date | Leave blank (auto-fills on publish) |
| Print options | Black & white interior with white paper *(unless figures need color)* |
| Trim size | 6 x 9 inches (standard business book) |
| Bleed | No bleed *(unless figures go to edge — ours don't)* |
| Cover finish | Matte (more premium feel) or Glossy |

> **Color vs B&W:** Our figures are amber/orange. If they need to be in color, select "Premium color" — this costs more per copy and reduces royalty margin. B&W prints figures in grayscale.

- [ ] Print options configured

### 4b. Manuscript Upload

- [ ] Upload: `kdp/manuscript/pivot-pyramid.docx` (or PDF)
	- KDP converts to print-ready format
- [ ] Upload cover: `kdp/covers/full-wrap-cover.png` (3923x2880)
	- Select "Upload a cover you already have"
	- KDP will validate dimensions against trim size + page count
- [ ] Use KDP Print Previewer to check:
	- [ ] Margins are adequate (no text cut off near edges)
	- [ ] Figures render in acceptable quality
	- [ ] Page count matches expectations (~123 pages)
	- [ ] Spine text is centered and readable

### 4c. Pricing

| Setting | Value |
|---------|-------|
| Territories | Worldwide |
| List price | **$19.99 USD** (check minimum — KDP shows printing cost) |

> KDP shows your **printing cost** and **royalty** per sale. For a ~123 page 6x9 B&W book, printing cost is roughly $3-4. At $19.99 list price, royalty is roughly $6-8 per sale (60% royalty rate for paperback).

- [ ] Click **Publish Your Paperback**

---

## Phase 5: Post-Publish Checklist

### Immediately (within 24-72 hours)

- [ ] Verify ebook is live on Amazon — search "The Pivot Pyramid Selcuk Atli"
- [ ] Save the **Amazon URL** and **ASIN** number
- [ ] Screenshot the Amazon listing page (for immigration evidence)
- [ ] Save screenshot to `resources/projects/pivot-pyramid/`
- [ ] Order a **proof copy** of paperback (if published) — check print quality

### Within First Week

- [ ] Update pivotpyramid.com with Amazon link / buy button
- [ ] Add Amazon listing to immigration evidence:
	- [ ] O-1A evidence list (`o1a-renewal/evidence-list.md`)
	- [ ] EB-1A evidence list (`eb1a-green-card/evidence-list.md`)
	- [ ] EB-1A criterion 5 — Original Contributions (`evidence-by-criterion/05-original-contributions.md`)
- [ ] Share on social media (Twitter, LinkedIn)
- [ ] Set up **Author Central** profile at [author.amazon.com](https://author.amazon.com)
	- Add author photo, bio, and link your book

### Ongoing

- [ ] Monitor reviews — respond thoughtfully to feedback
- [ ] Track sales in KDP Dashboard → Reports
- [ ] Consider running Amazon Ads (KDP Advertising) for visibility
- [ ] If enrolled in KDP Select: decide whether to renew after 90 days

---

## Assets Ready for Upload

| Asset | Path | Dimensions | Use |
|-------|------|-----------|-----|
| EPUB manuscript | `kdp/manuscript/pivot-pyramid.epub` | — | Ebook upload |
| DOCX manuscript | `kdp/manuscript/pivot-pyramid.docx` | — | Paperback upload |
| Front cover | `kdp/covers/front-cover-1600x2866.png` | 1600x2866 | Ebook cover |
| Front cover (Seedream) | `kdp/covers/front-cover-seedream.png` | 1920x2880 | Alt / marketing |
| Back cover | `kdp/covers/back-v6.png` | 1920x2880 | Reference |
| Spine | `kdp/covers/spine-programmatic.png` | 83x2880 | Reference |
| Full wrap cover | `kdp/covers/full-wrap-cover.png` | 3923x2880 | Paperback cover |
| 3D mockup | `kdp/covers/mockup-v1.png` | 1024x1024 | Marketing / social |
| Metadata | `kdp/metadata.md` | — | Copy into KDP fields |

---

> **Estimated time:** ~30 minutes for ebook, ~15 more for paperback.
> **Goes live:** 24-72 hours after clicking Publish.
