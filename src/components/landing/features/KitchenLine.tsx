import { FeaturePageContent } from "./FeatureLayout";


export const kitchenLineContent: FeaturePageContent = {
  eyebrow: "Feature — Kitchen line",
  headline: ["FIRE ON TIME.", "EVERY TIME."],
  dek: "A buried paper ticket is the reason six entrées die under the lamp while the kitchen swears everything's fine. Route by course, not by chance.",

  stats: [
    { value: "20–40%", label: "Ticket time reduction" },
    { value: "4.2 min", label: "Saved between ready and served" },
    { value: "24→14 min", label: "Average ticket time, sustained" },
  ],

  sections: [
    {
      heading: "The anatomy of a ticket time crisis",
      paragraphs: [
        "Walk into any kitchen during a Friday rush and you'll hear controlled chaos. Peel it back and almost every problem traces to one thing: the paper ticket. A physical ticket can only be in one place. It gets buried under a rail, splattered with sauce, or lost between the expo and the sauté station — and a six-top's entrées sit dying under the heat lamp while the salad course hasn't even fired. The expo yells, servers hover, and ticket time climbs past 28 minutes. On the other side of the wall, the guest has already decided they're not coming back.",
        "Kitchen Line replaces the paper rail and the shouting with a digital display that routes every item to the exact station that needs it, at the exact moment it needs to fire. The kitchen starts moving like a system instead of a scramble — ticket times drop 20 to 40%, remakes fall, and the expo station turns from a bottleneck into quality control.",
      ],
    },
    {
      heading: "Course logic, not guesswork",
      pullQuote:
        "All entrées finish within seconds of each other, and the expo plates and sends the whole course together — hot, fresh, and complete.",
      paragraphs: [
        "The core idea is course logic. A four-top rings in with two starters and four entrées — one well-done steak, one vegan risotto, two standard burgers. The system doesn't dump everything on one screen. It routes each component to its station and applies staggered firing: starters hit the cold line immediately, while entrée items hold in a suspended state. At minute four it releases the well-done steak, since well-done needs six or seven extra minutes, and the burger patties to the broiler. At minute six, the risotto. The kitchen never sends a dying salmon out next to a filet that's still ninety degrees.",
        "It also catches the domino effect before it starts. If the grill swipes a burger as fired but the bun station never got the notification, the discrepancy gets flagged. The expo sees the burger's been on heat seven minutes with no bun on the pass, and steps in before a server even thinks to ask where the fire on table 24 is.",
      ],
    },
    {
      heading: "The expo command console",
      paragraphs: [
        "The expo screen is the kitchen's nervous system — every active ticket in one colour-coded timeline, showing which tables are all-in on entrées, which are falling behind target cook time, and which haven't been acknowledged by a station at all. A tap lets the expo bump an item to fire, request a refire, or send a thirty-second hurry-up that flashes on the station screen.",
        "Once a course is fully plated, the expo taps sell and a runner gets a push notification: table 24, course 2, ready. No more servers camped in the kitchen doorway, no more food dying under a lamp because someone got triple-sat. The gap between a course being ready and being on the table drops by an average of 4.2 minutes — four minutes of quality, and four minutes off total table turn.",
      ],
    },
    {
      heading: "Allergen precision",
      paragraphs: [
        "On paper, \"no onions — severe allergy\" is a scribble a line cook can miss in the rush. On Kitchen Line, it renders as a high-contrast banner the cook can't dismiss until they actively acknowledge it. For a severe allergy, the system requires two confirmations — the station swipes acknowledged, and the expo separately verifies before the plate clears for pickup — creating an audit trail that protects the guest and the restaurant.",
        "It also talks to the recipe database. Remove cheese for a dairy allergy, and the display can warn that the potato purée also carries butter and cream, and suggest the substitution before the ticket fires. That closed loop is what keeps a GM off the ceiling at 2am.",
      ],
    },
    {
      heading: "Line balancing",
      paragraphs: [
        "The dashboard shows real-time load per station. If sauté is carrying fourteen active items while the grill has six, the sous chef gets an alert to flex a cook before the station collapses under its own weight — before someone starts cutting corners on sear just to keep up.",
        "A post-shift Line Efficiency Report breaks ticket time down by station, hour, and item. It might show the flat-top hitting 22-minute tickets every Saturday between 7:30 and 8:15, traced to the fryer basket queue. Fix that, and average ticket time moves from 24 minutes down to a sustained 14 — the threshold where guest satisfaction actually shifts.",
      ],
    },
  ],

  analyticsTitle: "The line, measured the way a kitchen actually runs.",
  analyticsIntro:
    "Analyze Line Metrics turns \"the kitchen felt slow tonight\" into a number you can act on tomorrow.",
  analyticsMetrics: [
    {
      title: "True ticket time",
      description:
        "Measured from order sent to guest delivery, not just to pass — compared against the same day last month.",
    },
    {
      title: "Misfire tracker",
      description:
        "Every dish fired and then held, and for how long, logged by station and by hour.",
    },
    {
      title: "Station load, 7-day view",
      description:
        "Load per station overlaid against labour hours, so staffing follows demand instead of habit.",
    },
  ],
  analyticsClosing:
    "This isn't a button — it's the start of a loop that makes the kitchen the most efficient and the safest one in the neighbourhood.",
  ctaLabel: "Analyze line metrics",
};