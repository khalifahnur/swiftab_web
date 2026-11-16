import type { FeaturePageContent } from "./FeatureLayout";


export const floorServersContent: FeaturePageContent = {
  eyebrow: "Feature — Floor servers",
  headline: ["TURN SERVERS INTO", "REVENUE ATHLETES."],
  dek: "Every minute a server spends walking to a terminal is a minute they're not building the check — or the relationship. Put the terminal in their apron.",

  stats: [
    { value: "22 min", label: "Saved per server, per shift" },
    { value: "18–22%", label: "Lift in upsell attachment" },
    { value: "KSh 1,241,760 - KSh 1,552,200", label: "Incremental revenue, per week" },
  ],

  sections: [
    {
      heading: "The server as a revenue athlete",
      paragraphs: [
        "A great server is a salesperson, a logistics coordinator, a brand ambassador, and a psychologist, all while walking eight miles a shift. Traditional operations hand this person the worst tools available: a paper pad that means walking to a stationary terminal, waiting behind three other servers, and re-keying the order by hand. Every minute at that terminal is a minute not spent at the table building rapport and spotting the next opening. Floor Servers replaces the terminal with a handheld that turns the apron itself into a mobile point of sale, a guest intelligence hub, and an upsell coach — all at once.",
      ],
    },
    {
      heading: "Handheld ordering, instant kitchen transmission",
      paragraphs: [
        "Servers take orders tableside on a device as intuitive as a phone — photos on the menu, modifications a tap instead of a scribble. The moment they hit send, the order breaks apart and routes straight to the kitchen line and the bar. No walk to a terminal, no queue, no re-keying error. Across a fifteen-table section, that saves a server roughly 22 minutes a shift in pure walking and waiting — 22 minutes put back into guest interaction and suggestive selling instead.",
        "Order chaining works the way a real shift does. A server can start table 12, pause for a drink order at table 15, and pick 12 back up without losing context. Split checks are a drag-and-drop instead of a mental math exercise, including shared-item fractions — which matters, because friction at the end of a meal is exactly where tip percentage quietly erodes.",
      ],
    },
    {
      heading: "The silent upsell coach",
      pullQuote: "78% of guests who add this give positive feedback.",
      paragraphs: [
        "This is where Floor Servers becomes a genuine revenue multiplier. The handheld prompts contextual upsells based on what's already on the table — a ribeye ordered triggers a soft prompt for the truffle butter add-on, a bottle of red triggers a suggestion to pair it with the charcuterie board. The cards are dismissible; if the moment isn't right, the server swipes past. But it's a constant, data-driven nudge toward the high-margin items that also happen to make the meal better.",
        "The engine learns over time — correlating successful upsells with server, daypart, party size, and even weather, so a rainy Tuesday leans toward comfort-food add-ons instead of a salad nobody wants. In pilots, this lifted add-on attachment 18 to 22% and average check per guest 12 to 15%. At 2,000 covers a week and a $40 average, that's $9,600 to $12,000 a week directly attributable to what's on the server's wrist, not a new item on the menu.",
      ],
    },
    {
      heading: "Payment at the table",
      paragraphs: [
        "The end of a meal is where a lot of restaurants lose time they don't get back. Drop the check, wait for the card, walk it to a terminal, walk back with a receipt — ten to fifteen minutes for a table that's ready to leave and a restaurant that needs it for the next seating. Floor Servers brings the terminal to the table. The guest taps to pay right there, contactless or mobile wallet, receipt sent instantly. The card never leaves their sight, which reads as both faster and more secure.",
        "That drop-and-pay window shrinks from 12 minutes to under 3. Across a 120-seat room turning three times a night, that's enough recovered time for a genuine extra turn on a busy night — and because the tip interface is set intelligently by check size, servers in pilot locations saw tip averages rise 3 to 5% simply because the guest wasn't left waiting for a machine.",
      ],
    },
    {
      heading: "Guest profiles at scale",
      paragraphs: [
        "Every order builds a guest profile. A server greeting a repeat guest sees, before they say a word: still water, dairy intolerance, ordered the halibut last time. \"Welcome back — I know you loved the halibut, but chef has a sea bass tonight with a coconut broth that's dairy-free. Still water to start?\" That kind of recognition used to belong exclusively to ten-table Michelin rooms. It scales here to every table, every shift.",
      ],
    },
  ],

  analyticsTitle: "Every server, measured the way a coach would.",
  analyticsIntro:
    "Inspect Server Tools is built for the GM and the lead server team who actually want to grow the check, not just watch it.",
  analyticsMetrics: [
    {
      title: "Time & motion study",
      description:
        "Time at table versus time at terminal versus idle — benchmark your best server and coach the rest to that standard.",
    },
    {
      title: "Upsell leaderboard",
      description:
        "Ranked by attachment rate, average check, and tip percentage. Turns service into something staff can see themselves winning at.",
    },
    {
      title: "Dwell time heat map",
      description:
        "How long each table spends ordering, eating, and paying — spot the exact step that's creating the bottleneck.",
    },
    {
      title: "Guest sentiment tie-in",
      description:
        "Where a post-dining survey is connected, satisfaction ties back to the individual server and shift.",
    },
  ],
  analyticsClosing:
    "This is the data that proves great service is profitable — and a way to build a team of well-compensated revenue athletes on purpose, instead of by accident.",
  ctaLabel: "Inspect server tools",
};