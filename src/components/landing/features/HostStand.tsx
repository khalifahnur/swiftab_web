import type { FeaturePageContent } from "./FeatureLayout";


export const hostStandContent: FeaturePageContent = {
  eyebrow: "Feature — Host stand",
  headline: ["STOP LOSING COVERS", "AT THE DOOR."],
  dek: "Every empty table held for a no-show is a walk-in that left instead. The host stand should know the difference before it costs you the night.",

  stats: [
    { value: "35–45", label: "Covers lost most Fridays" },
    { value: "20–30", label: "Additional covers recovered" },
    { value: "KSh 116,568-KSh 174,852", label: "Incremental revenue per shift" },
  ],

  sections: [
    {
      heading: "The hidden cost of a manual host stand",
      paragraphs: [
        "In the modern restaurant, the host stand is far more than a podium and a paper waitlist. It is the nervous system of the entire dining floor. Every time a party walks in, a cascade of decisions must be made in seconds — how many covers, which section has capacity, is a two-top about to finish dessert, can a guest's request for a booth by the window be honored without double-seating an already-weeded server? For decades this calculus lived in the head of a veteran host, scribbled on a dry-erase seating chart. The result was predictable: walk-in bleed, pacing mistakes, inaccurate quote times, and a steady erosion of cover counts that owners chalked up to \"a slow Tuesday.\"",
        "Host Stand dismantles that assumption. The chaos at the front door isn't inevitable — it's a data problem waiting to be solved. By digitising the entire arrival-to-seating workflow, the host stand becomes a command centre that maximises daily covers without adding a single table. The difference isn't marginal — it's the gap between a 90-cover night and a 115-cover night on the same floor plan.",
      ],
    },
    {
      heading: "Automated waitlist & two-way SMS",
      paragraphs: [
        "The first touchpoint is the digital waitlist. Instead of a paper sheet guests squint at over a host's shoulder, the system captures party name, size, contact number, and special requests — highchair, accessibility, bar preference — in seconds. The moment a guest joins the list, an automated SMS confirms their spot and links to a live queue position. No more crowding the host stand asking \"how much longer?\" The guest can wait at the bar, browse nearby, or wait in the car, and return only when the table is ready.",
        "The SMS channel runs both ways. When the host is ready to seat, one tap sends \"your table is ready.\" If the guest replies \"2 mins,\" that flows straight into the host's dashboard, preventing a premature table release. The system tracks response times and no-show patterns, building a reliability profile for repeat guests — so the host knows the Friday regular who's always five minutes late, and paces the floor around it instead of holding a table hostage to a party that may not show.",
      ],
    },
    {
      heading: "Dynamic floor pacing & predictive turn times",
      pullQuote:
        "A host looks at a table, sees a half-finished bottle of wine, and mentally estimates \"fifteen minutes.\" That estimate is almost always wrong.",
      paragraphs: [
        "This is where Host Stand earns its place as a revenue engine. Traditional host stands run on guesswork. This system ingests live POS and kitchen data to calculate accurate, minute-by-minute table status — it knows a table is on course three of five, that dessert menus have dropped, and what the average dwell time for a four-top runs on a Saturday. Paired with the waitlist queue and server section assignments, it produces a real-time seating recommendation instead of a guess.",
        "The host sees a floor map where tables glow green (ready within five minutes), yellow (approaching the tail of the meal), or red (just seated, do not touch). A seating algorithm balances section load automatically — if one server has just been triple-sat, the next party is steered toward an open section, even if that costs the guest two extra minutes for a window table. The host can override with a tap, but the default path prevents the bottlenecks that turn into 45-minute tickets and a kitchen in meltdown.",
      ],
    },
    {
      heading: "What walk-in bleed actually costs",
      paragraphs: [
        "In a 120-seat restaurant turning tables 1.5 times a night, the theoretical maximum is 180 covers. Most restaurants running a manual host stand capture 135–145 on a full Friday — 35 to 45 covers left on the table, literally. Those losses come from a ten-minute gap between turns caused by slow bussing, a table held for a VIP still at the bar, or a section the host simply forgot about for twenty minutes.",
        "Host Stand closes each gap systematically. The moment a party pays and stands, the nearest busser gets a push notification — that ten-minute gap shrinks to three. Table statuses update instantly, so nothing gets forgotten. Because the system tracks historical turn data by party size, day, and weather, it predicts that the six-top celebrating a birthday will run fifteen minutes long, and lets the host place a soft hold while seating a walk-in two-top in the meantime. Multiply that across a hundred tables on a busy night and it adds up to 20 to 30 additional covers — at a $45 per-person average, that's $900 to $1,350 in incremental revenue, in a single shift.",
      ],
    },
    {
      heading: "From transaction to hospitality",
      paragraphs: [
        "The revenue case is strong, but Host Stand also solves a real hospitality problem: the anxiety of waiting. A quoted \"thirty to forty minutes\" feels like an eternity in a noisy lobby. When a guest gets a live countdown by SMS and can order a drink from the bar digitally, the wait stops being dead time — it becomes part of the evening. And the host, no longer fielding \"how much longer,\" can actually greet people and walk them to the table.",
        "The system also remembers guest preferences and visit history. When a regular arrives, the host's screen prompts quietly: prefers a quiet booth, shellfish allergy, celebrated an anniversary here last year. That moment of recognition — \"great to see you again, your usual booth is ready\" — builds loyalty no punch card ever will.",
      ],
    },
  ],

  analyticsTitle: "See the front door the way a P&L does.",
  analyticsIntro:
    "Review Host Analytics turns the front door from a cost centre into a lever you can actually pull.",
  analyticsMetrics: [
    {
      title: "Turn time compliance",
      description:
        "Actual turn times against quoted times, by party size and by server — see which sections are dragging.",
    },
    {
      title: "Walk-in conversion rate",
      description:
        "The share of guests who inquired about a table and were actually seated. Below 80%, there's a leak.",
    },
    {
      title: "Waitlist abandonment",
      description:
        "How many parties added their name and never responded to the ready SMS — a sign quote times are off.",
    },
    {
      title: "No-show & ghost trends",
      description:
        "Patterns by day and weather, so you can hold or overbook with real confidence instead of a guess.",
    },
  ],
  analyticsClosing:
    "A GM can walk into a Friday pre-shift and say: last week we lost twelve covers over-quoting the seven-to-eight slot. Tonight we trust the predictive turn times and go after 200 covers.",
  ctaLabel: "Review host analytics",
};