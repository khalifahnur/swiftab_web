import type { FeaturePageContent } from "./FeatureLayout";


export const managementContent: FeaturePageContent = {
  eyebrow: "Feature — Management",
  headline: ["SEE THE MARGIN", "BEFORE IT BLEEDS."],
  dek: "Food cost running at 34% instead of 30% shows up on next month's P&L. By then, the shift that caused it is long over.",

  stats: [
    { value: "2–4 pts", label: "Food cost recovered via live auditing" },
    { value: "5–7%", label: "Net margin improvement from leak detection" },
    { value: "1 pt", label: "Food cost swing = tens of thousands a year" },
  ],

  sections: [
    {
      heading: "From gut-feel to real-time profit",
      paragraphs: [
        "Restaurant management is often just putting out fires — a short-staffed dish pit, a comp for a guest who waited too long, a hand count of the drawer, all in the same hour. Then the P&L lands at month-end and the real fire starts: food cost at 34% instead of 30%, labour at 32% instead of 28%, and no one can say exactly why. Management turns the GM from a reactive crisis-handler into someone who catches the leak while the shift is still open, not thirty days later.",
      ],
    },
    {
      heading: "Real-time food cost auditing",
      pullQuote:
        "A one-point swing in food cost percentage can mean tens of thousands of dollars a year.",
      paragraphs: [
        "Most restaurants only calculate food cost during a monthly inventory — far too late to catch the over-portioning that caused it. Management ties into inventory and recipe costing so every dish sold is deconstructed into its recipe, and theoretical cost is compared against actual depletion in real time. If a cook is plating six ounces of salmon against a five-ounce spec, the manager gets an alert while the salmon count is still dropping, not after it's gone: usage trending 12% above theoretical, possible over-portioning on the grill.",
        "A single correction on the line might save eighty dollars that night. Compounded over a month, these micro-corrections typically recover 2 to 4 percentage points of food cost. The same dashboard flags disappearing inventory — bottled beer, premium spirits, expensive proteins — where a variance spike is often the first sign of theft, and time-stamped data turns that from an accusation into evidence.",
      ],
    },
    {
      heading: "Labour, tracked by the hour",
      paragraphs: [
        "Schedules are built on a sales forecast, but when a shift runs busier than expected, staff often stay on the clock too long simply because everyone's in the weeds. Management shows the percentage of net sales going to labour for every hour of the current shift against the scheduled target — if 7 to 8pm is supposed to run at 22% and it's showing 27%, the manager can see exactly which department is over and act before the shift ends, not after.",
        "It also tracks unworked breaks and overtime risk, flagging anyone approaching 40 hours in yellow, then red, so Sunday morning doesn't arrive with an unplanned overtime bill. And it surfaces sales-per-labour-hour by station, so a sauté line running $45 an hour next to a grill holding $70 becomes a scheduling decision instead of a mystery.",
      ],
    },
    {
      heading: "Catching the small leaks",
      paragraphs: [
        "Beyond food and labour, margin disappears in smaller places — over-discounting, comps without approval, voids that quietly hide theft. Any comp above a set threshold requires a reason code and manager override, and the system aggregates those by server, table, and reason. If one server's kitchen-error comp rate is running at 4% against a restaurant average of 1.2%, that's worth a look — a training gap, or a station issue only that section is dealing with.",
        "Voids get the same treatment: timestamped, tied to server and dish, with a pattern of high-ticket voids after 10pm flagged as a classic red flag worth reviewing. None of these leaks are individually dramatic. Plugged together, restaurants typically see a 5 to 7% improvement in net operating margin, without raising a single guest's check.",
      ],
    },
    {
      heading: "Forecasting, not just reporting",
      paragraphs: [
        "The same engine that tracks today also forecasts tomorrow — using historical sales, the local events calendar, and weather to project sales by daypart, then generating an optimal roster in 15-minute increments that respects availability and seniority. What used to be a four-hour weekly scheduling task becomes a review-and-publish. The projected prime cost — food plus labour as a share of sales — updates live through the shift, so if it creeps past target, there's still time to run a high-margin special or send a later cook home before the number is locked in.",
      ],
    },
  ],

  analyticsTitle: "Every dial live, every alarm actionable.",
  analyticsIntro:
    "Audit Admin Controls is where the guardrails get set — because a fine-dining room's tolerances aren't a high-volume kitchen's tolerances.",
  analyticsMetrics: [
    {
      title: "Comp & override thresholds",
      description:
        "Set the dollar limit that triggers a manager override on any comp, restaurant by restaurant.",
    },
    {
      title: "Food cost variance alerts",
      description:
        "Define the variance percentage that sends an SMS straight to the owner, not just the GM.",
    },
    {
      title: "Accounting & payroll sync",
      description:
        "Manage the integrations that keep the P&L and the schedule talking to the same numbers.",
    },
  ],
  analyticsClosing:
    "Open the app and see food cost at 29.8%, labour at 27.3%, and a projected prime cost of 57.1% — not a guess, a live read. That's the peace of mind a multi-unit group is actually built on.",
  ctaLabel: "Audit admin controls",
};