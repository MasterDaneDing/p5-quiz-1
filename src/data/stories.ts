import { assetUrl } from "@/lib/asset-url";

export type StoryId = "lovely" | "robo";

export type StoryPage = {
  image: string;
  caption: string;
};

export type Story = {
  id: StoryId;
  title: string;
  quizTitle: string;
  kicker: string;
  pages: StoryPage[];
};

const lovelyCaptions = [
  "Welcome to Lovely School!",
  "It is open day at Lovely School. How should we dress?",
  "We should dress tidily.",
  "We shouldn’t dress untidily!",
  "We should smile for the school photos!",
  "We shouldn’t make silly faces!",
  "We should look at the camera!",
  "We shouldn’t talk loudly in the corridor!",
  "You should arrive at school before 8 o’clock.",
  "You must go to bed earlier!",
  "You should speak politely to the guests.",
  "You mustn’t speak impolitely to the guests!",
  "We should keep our classroom clean and tidy.",
  "We should not eat in the classroom!",
  "Please eat in the canteen!",
  "Jimmy thinks the canteen food is bad but I don’t agree with him.",
  "I think it is delicious!",
  "I often help the canteen lady with the cooking!",
  "I often help her get the ingredients too!",
  "I love my best friend, Mon-Mon. He always takes care of me. When I am bullied, he protects me.",
  "When I am bullied, he protects me.",
  "No one likes Mr. Eel. He always makes everyone wet.",
  "",
  "‘Thank you for letting me see your school, Principal Lovely. I think I will go to another school.’",
  "‘Wow! Thank you so much, Principal Lovely! You are such a kind principal!’\n‘That’s ok! I hope you enjoy your new school. Thank you for coming!’",
  "There is a ‘Kick me’ sign on the boy’s back.",
  "‘I don’t want to go to Lovely School I found a much better school!’",
];

export const stories: Record<StoryId, Story> = {
  lovely: {
    id: "lovely",
    title: "Lovely School",
    quizTitle: "Lovely School - Quiz!",
    kicker: "Open day",
    pages: lovelyCaptions.map((caption, i) => ({
      image: assetUrl(`stories/lovely/${String(i + 1).padStart(2, "0")}.jpg`),
      caption,
    })),
  },
  robo: {
    id: "robo",
    title: "Officer Robo",
    quizTitle: "Officer Robo - Quiz!",
    kicker: "Follow the rules",
    pages: [
      {
        image: assetUrl("stories/robo/01.jpg"),
        caption:
          "Officer Robo! Go outside and make sure people are following the rules!\nYes sir! I will go outside now.",
      },
      {
        image: assetUrl("stories/robo/02.jpg"),
        caption: "I don’t want to wait in the queue. I want to go to the front!",
      },
      { image: assetUrl("stories/robo/03.jpg"), caption: "" },
      {
        image: assetUrl("stories/robo/04.jpg"),
        caption: "You should wait patiently in the queue!",
      },
      {
        image: assetUrl("stories/robo/05.jpg"),
        caption: "Officer Robo! Someone is shouting in the restaurant!",
      },
      { image: assetUrl("stories/robo/06.jpg"), caption: "" },
      {
        image: assetUrl("stories/robo/07.jpg"),
        caption: "You should speak softly in restaurants!",
      },
      {
        image: assetUrl("stories/robo/08.jpg"),
        caption: "Officer Robo! Some students are fighting over the toilets!",
      },
      { image: assetUrl("stories/robo/09.jpg"), caption: "" },
      {
        image: assetUrl("stories/robo/10.jpg"),
        caption: "We must wait for our turn.",
      },
      {
        image: assetUrl("stories/robo/11.jpg"),
        caption: "We shouldn’t speak loudly on our phones on the MTR!",
      },
      {
        image: assetUrl("stories/robo/12.jpg"),
        caption: "Officer Robo needs to eat dinner with Mrs. Robo at seven o’clock.",
      },
      { image: assetUrl("stories/robo/13.jpg"), caption: "" },
      {
        image: assetUrl("stories/robo/14.jpg"),
        caption: "You should not be late.",
      },
    ],
  },
};
