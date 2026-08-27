const db = require("./db");

const mockQuestions = [
    // --- Math Questions ---
    {
        subject: "Math",
        topic: "Algebra",
        question_text: "If 3x + 7 = 19, what is the value of 2x - 3?",
        option_a: "1",
        option_b: "5",
        option_c: "9",
        option_d: "11",
        correct_answer: "B",
        explanation: "Solve 3x + 7 = 19: subtract 7 to get 3x = 12, then divide by 3 to get x = 4. Substitute x = 4 into 2x - 3: 2(4) - 3 = 8 - 3 = 5.",
        difficulty: "Easy"
    },
    {
        subject: "Math",
        topic: "Geometry",
        question_text: "A right triangle has legs of length 6 and 8. What is the length of its hypotenuse?",
        option_a: "9",
        option_b: "10",
        option_c: "12",
        option_d: "14",
        correct_answer: "B",
        explanation: "Use the Pythagorean theorem: a^2 + b^2 = c^2. Here, 6^2 + 8^2 = 36 + 64 = 100. Thus, c = sqrt(100) = 10.",
        difficulty: "Easy"
    },
    {
        subject: "Math",
        topic: "Percentages",
        question_text: "A jacket originally costing $80 is on sale for 25% off. What is the sale price of the jacket?",
        option_a: "$20",
        option_b: "$55",
        option_c: "$60",
        option_d: "$75",
        correct_answer: "C",
        explanation: "Calculate the discount: 25% of $80 = 0.25 * 80 = $20. Subtract the discount from the original price: 80 - 20 = $60.",
        difficulty: "Easy"
    },
    {
        subject: "Math",
        topic: "Statistics",
        question_text: "What is the median of the following set of scores: 12, 5, 22, 30, 7, 15, 20?",
        option_a: "12",
        option_b: "15",
        option_c: "16",
        option_d: "20",
        correct_answer: "B",
        explanation: "First, arrange the scores in ascending order: 5, 7, 12, 15, 20, 22, 30. The middle value is 15, which is the median.",
        difficulty: "Medium"
    },
    {
        subject: "Math",
        topic: "Problem solving",
        question_text: "A car travels at an average speed of 60 miles per hour. How many minutes will it take the car to travel 45 miles?",
        option_a: "35",
        option_b: "40",
        option_c: "45",
        option_d: "50",
        correct_answer: "C",
        explanation: "Time = Distance / Speed = 45 / 60 = 0.75 hours. Convert to minutes: 0.75 * 60 = 45 minutes.",
        difficulty: "Medium"
    },
    {
        subject: "Math",
        topic: "Algebra",
        question_text: "Solve for y: 4(y - 3) = 2y + 8",
        option_a: "4",
        option_b: "6",
        option_c: "8",
        option_d: "10",
        correct_answer: "D",
        explanation: "Expand: 4y - 12 = 2y + 8. Subtract 2y: 2y - 12 = 8. Add 12: 2y = 20. Divide by 2: y = 10.",
        difficulty: "Medium"
    },
    {
        subject: "Math",
        topic: "Geometry",
        question_text: "The area of a circle is 36π. What is the circumference of this circle?",
        option_a: "6π",
        option_b: "12π",
        option_c: "18π",
        option_d: "36π",
        correct_answer: "B",
        explanation: "Area = π*r^2 = 36π. Therefore, r^2 = 36 and r = 6. Circumference = 2*π*r = 2*π*6 = 12π.",
        difficulty: "Medium"
    },
    {
        subject: "Math",
        topic: "Percentages",
        question_text: "If a number is increased by 20% and then decreased by 20%, what is the net percentage change of the number?",
        option_a: "No change",
        option_b: "2% decrease",
        option_c: "4% decrease",
        option_d: "4% increase",
        correct_answer: "C",
        explanation: "Let the number be 100. Increased by 20%: 100 * 1.20 = 120. Decreased by 20%: 120 * 0.80 = 96. Net change: 100 to 96 is a 4% decrease.",
        difficulty: "Hard"
    },
    {
        subject: "Math",
        topic: "Algebra",
        question_text: "If f(x) = x^2 - 3x + 5, what is f(x - 2)?",
        option_a: "x^2 - 7x + 15",
        option_b: "x^2 - 5x + 15",
        option_c: "x^2 - 3x + 15",
        option_d: "x^2 - 7x + 5",
        correct_answer: "A",
        explanation: "Replace x with (x - 2): f(x-2) = (x-2)^2 - 3(x-2) + 5 = x^2 - 4x + 4 - 3x + 6 + 5 = x^2 - 7x + 15.",
        difficulty: "Hard"
    },
    {
        subject: "Math",
        topic: "Statistics",
        question_text: "A box contains 5 red balls, 3 blue balls, and 2 green balls. If two balls are drawn at random without replacement, what is the probability that both balls are red?",
        option_a: "2/9",
        option_b: "1/4",
        option_c: "2/5",
        option_d: "1/2",
        correct_answer: "A",
        explanation: "First ball probability = 5/10 = 1/2. Second ball (no replacement) = 4/9. Combined probability = (5/10) * (4/9) = 20/90 = 2/9.",
        difficulty: "Hard"
    },
    // --- Reading Questions ---
    {
        subject: "Reading",
        topic: "Main idea",
        question_text: "Passage: Standardized tests have evolved significantly since their inception. Originally designed as IQ tests during WWI, they are now primarily utilized by universities to predict college preparedness. Critics suggest these exams reflect socioeconomic status rather than aptitude. Regardless, they remain a gatekeeper for academic admission.\n\nWhich statement best captures the main idea of the passage?",
        option_a: "Standardized tests are the most accurate way to predict student success.",
        option_b: "University applications should exclude all standardized test results.",
        option_c: "Standardized tests have shifted in function but continue to hold institutional importance despite criticisms.",
        option_d: "Standardized tests were created as military IQ measures during the First World War.",
        correct_answer: "C",
        explanation: "The passage discusses the evolution of tests, their current university utility, criticisms, and concludes with their enduring power as academic gatekeepers.",
        difficulty: "Easy"
    },
    {
        subject: "Reading",
        topic: "Vocabulary",
        question_text: "Sentence: 'The scientist's hypothesis was bolstered by new geological evidence, convincing the committee to extend her research grant.'\n\nAs used in the sentence, 'bolstered' most nearly means:",
        option_a: "Weakened",
        option_b: "Supported",
        option_c: "Interrupted",
        option_d: "Announced",
        correct_answer: "B",
        explanation: "The phrase 'bolstered by new evidence, convincing the committee...' suggests that the evidence strengthened or supported the hypothesis.",
        difficulty: "Easy"
    },
    {
        subject: "Reading",
        topic: "Inference",
        question_text: "Passage: When the municipal library reduced its hours, student visit rates dropped by 40%. Meanwhile, local internet cafes saw an unprecedented surge in student patronage, with many staying until closing hours to work on assignments.\n\nWhat can be logically inferred from the passage?",
        option_a: "Students prefer working in noisy internet cafes rather than quiet libraries.",
        option_b: "Many students rely on the library primarily for internet access or workspace to complete assignments.",
        option_c: "The library's books were outdated, so students switched to online resources.",
        option_d: "Internet cafes are offering free printing to attract students.",
        correct_answer: "B",
        explanation: "The direct relationship between the library closing earlier and students moving to internet cafes to do homework points to their need for workspaces and/or internet access.",
        difficulty: "Medium"
    },
    {
        subject: "Reading",
        topic: "Evidence",
        question_text: "Passage: NASA's Perseverance rover discovered high concentrations of organic molecules in Jezero Crater. Scientists assert this indicates that the ancient Martian lake could have supported microbial life, though they emphasize organic molecules are not definitive proof of past biological activity.\n\nWhich finding would best support the scientists' assertion that the crater was habitable?",
        option_a: "Evidence of liquid water presence in the crater's geological past.",
        option_b: "An analysis showing that organic molecules can form without water.",
        option_c: "A discovery of ancient volcanic ash deposits nearby.",
        option_d: "The finding of organic molecules on dry asteroids.",
        correct_answer: "A",
        explanation: "Habitability for life as we know it requires liquid water. Finding liquid water evidence alongside organic molecules strongly supports Martian habitability.",
        difficulty: "Medium"
    },
    {
        subject: "Reading",
        topic: "Passage analysis",
        question_text: "Passage: The industrial revolution fundamentally changed time keeping. Before factories, agricultural schedules depended on sunrise and season. Afterward, shifts were governed by mechanical clocks. This synchronization boosted productivity but alienated workers from their natural biological cycles.\n\nWhat is the author's primary attitude toward time synchronization?",
        option_a: "Unqualified praise for mechanical accuracy.",
        option_b: "Sarcastic dismissal of productivity gains.",
        option_c: "Recognition of economic benefits tempered by concern for human well-being.",
        option_d: "Indifference to pre-industrial farming methods.",
        correct_answer: "C",
        explanation: "The author notes that synchronization 'boosted productivity' (positive/neutral) but 'alienated workers from natural cycles' (negative), reflecting a balanced, critical view.",
        difficulty: "Medium"
    },
    {
        subject: "Reading",
        topic: "Main idea",
        question_text: "Passage: Overconsumption of plastics has led to microplastics infiltrating deep sea ecosystems, human bloodstream systems, and high alpine rain. Current local recycling programs collect less than 9% of plastics manufactured. A structural transition away from plastic reliance is necessary.\n\nWhich statement best summarizes the primary purpose of the passage?",
        option_a: "To defend current local recycling program yields.",
        option_b: "To lobby for structural change and decreased plastic production.",
        option_c: "To detail the chemical composition of microplastics in bloodstream systems.",
        option_d: "To compare alpine rain ecosystems with deep sea environments.",
        correct_answer: "B",
        explanation: "The author argues that current recycling is inadequate (9%) and calls for a 'structural transition away from plastic reliance', aiming to lobby for systemic reduction.",
        difficulty: "Medium"
    },
    {
        subject: "Reading",
        topic: "Vocabulary",
        question_text: "Sentence: 'Her style of governance was characterized by a meticulous attention to detail, which sometimes bordered on the pedantic.'\n\nAs used in the sentence, 'pedantic' most nearly means:",
        option_a: "Inattentive",
        option_b: "Overly concerned with formal rules or details",
        option_c: "Innovative and flexible",
        option_d: "Generous and forgiving",
        correct_answer: "B",
        explanation: "The context connects 'pedantic' to a bordering state of 'meticulous attention to detail', aligning it with being overly detail-oriented or nitpicky.",
        difficulty: "Hard"
    },
    {
        subject: "Reading",
        topic: "Inference",
        question_text: "Passage: While deep-sea hydrothermal vents emit toxic sulfides and boil at 400°C, they support dense communities of tube worms and crabs. These organisms do not rely on sunlight but rather on chemotrophic bacteria that convert chemicals into energy.\n\nWhat does the survival of vent ecosystems suggest about life?",
        option_a: "Photosynthesis is the only viable foundation for complex life forms.",
        option_b: "Some ecosystems can exist completely independent of solar energy pathways.",
        option_c: "Sulfides are harmless to marine organisms.",
        option_d: "Hydrothermal vents are cooling down rapidly.",
        correct_answer: "B",
        explanation: "Since these organisms survive on chemical energy (chemosynthesis) instead of sunlight, the vent ecosystem shows life can thrive independently of solar energy.",
        difficulty: "Hard"
    },
    {
        subject: "Reading",
        topic: "Evidence",
        question_text: "Passage: Historical documents reveal that the printing press led to a massive spike in literacy rates in Europe during the 15th century. Scholars argue that the increase in literacy was driven by the availability of vernacular translations of texts rather than the print technology itself.\n\nWhich of the following, if true, would best weaken the scholars' argument?",
        option_a: "Literacy rates also rose in regions where only Latin texts were printed.",
        option_b: "Vernacular translations were common before the printing press but did not increase literacy.",
        option_c: "The cost of printing vernacular texts was lower than printing Latin texts.",
        option_d: "Most European leaders in the 15th century could read both Latin and the vernacular.",
        correct_answer: "A",
        explanation: "If literacy rose even where only Latin (non-vernacular) texts were printed, it contradicts the claim that vernacular translations (rather than the print tech itself) drove the literacy spike.",
        difficulty: "Hard"
    },
    {
        subject: "Reading",
        topic: "Vocabulary",
        question_text: "Sentence: 'His arguments during the debate were marked by a specious coherence; while they sounded convincing at first, closer scrutiny revealed logical fallacies.'\n\nAs used in the sentence, 'specious' most nearly means:",
        option_a: "Genuine and honest",
        option_b: "Superficially plausible but actually wrong",
        option_c: "Deeply philosophical",
        option_d: "Difficult to hear",
        correct_answer: "B",
        explanation: "The sentence notes that the argument 'sounded convincing at first' but 'closer scrutiny revealed logical fallacies', meaning it was superficially plausible but incorrect.",
        difficulty: "Hard"
    },
    // --- 10 Additional SAT Questions ---
    {
        subject: "Math",
        topic: "Algebra",
        question_text: "If 5x - 4 = 21, what is the value of x?",
        option_a: "3",
        option_b: "4",
        option_c: "5",
        option_d: "6",
        correct_answer: "C",
        explanation: "Solve 5x - 4 = 21: add 4 to both sides to get 5x = 25, then divide by 5 to get x = 5.",
        difficulty: "Easy"
    },
    {
        subject: "Math",
        topic: "Geometry",
        question_text: "What is the area of a rectangle with a width of 8 and a diagonal length of 10?",
        option_a: "24",
        option_b: "32",
        option_c: "48",
        option_d: "80",
        correct_answer: "C",
        explanation: "Using the Pythagorean theorem, the height of the rectangle is sqrt(10^2 - 8^2) = sqrt(100 - 64) = sqrt(36) = 6. The area of the rectangle is width * height = 8 * 6 = 48.",
        difficulty: "Medium"
    },
    {
        subject: "Math",
        topic: "Percentages",
        question_text: "If the price of a computer is decreased by 10%, and then the sale price is increased by 20%, what is the net percent change from the original price?",
        option_a: "8% increase",
        option_b: "10% increase",
        option_c: "12% increase",
        option_d: "18% increase",
        correct_answer: "A",
        explanation: "Let the original price be 100. A 10% decrease makes it 90. A 20% increase on 90 is 90 * 1.20 = 108. The net change from 100 to 108 is an 8% increase.",
        difficulty: "Hard"
    },
    {
        subject: "Math",
        topic: "Statistics",
        question_text: "What is the average (arithmetic mean) of the numbers 4, 8, 12, 16, and 20?",
        option_a: "10",
        option_b: "12",
        option_c: "14",
        option_d: "16",
        correct_answer: "B",
        explanation: "Sum of the numbers = 4 + 8 + 12 + 16 + 20 = 60. Number of terms = 5. Average = 60 / 5 = 12.",
        difficulty: "Easy"
    },
    {
        subject: "Math",
        topic: "Problem solving",
        question_text: "A container holds 5 liters of a 20% acid solution. How many liters of pure water must be added to dilute it to a 10% acid solution?",
        option_a: "2.5 liters",
        option_b: "5 liters",
        option_c: "7.5 liters",
        option_d: "10 liters",
        correct_answer: "B",
        explanation: "Amount of pure acid originally = 5 * 0.20 = 1 liter. For 1 liter of acid to represent a 10% solution, the total volume of the solution must be 1 / 0.10 = 10 liters. Thus, we must add 10 - 5 = 5 liters of pure water.",
        difficulty: "Hard"
    },
    {
        subject: "Reading",
        topic: "Vocabulary",
        question_text: "Sentence: 'Her quiet demeanor at the party made her seem distant, but those who spoke with her found her to be warm and engaging.'\n\nAs used in the sentence, 'demeanor' most nearly means:",
        option_a: "Outfit",
        option_b: "Location",
        option_c: "Behavior",
        option_d: "Reputation",
        correct_answer: "C",
        explanation: "In this context, 'quiet demeanor' refers to her quiet behavior or outward bearing.",
        difficulty: "Easy"
    },
    {
        subject: "Reading",
        topic: "Main idea",
        question_text: "Passage: While deep space exploration captures public attention, deep ocean research remains critically underfunded. Oceans regulate global climates, absorb carbon emissions, and host millions of undiscovered species. Yet, we have mapped more of the Moon's surface than our own sea floors.\n\nWhich statement best summarizes the main point of the passage?",
        option_a: "Space exploration is a waste of global resources.",
        option_b: "We need to prioritize ocean research due to its massive ecological importance.",
        option_c: "Mapped lunar craters are more interesting than deep sea species.",
        option_d: "Ocean ecosystems are absorbing too much carbon dioxide.",
        correct_answer: "B",
        explanation: "The passage stresses the ecological value of oceans and details how they are underfunded compared to space, arguing that deep ocean research must be prioritized.",
        difficulty: "Medium"
    },
    {
        subject: "Reading",
        topic: "Inference",
        question_text: "Passage: Researchers observed that urban crows use traffic lights to crack nuts. They drop walnuts in front of stopped vehicles, wait for the light to turn green so cars drive over and crack them, and then retrieve the pieces when the light turns red again and traffic stops.\n\nWhat does this behavior most clearly demonstrate about urban crows?",
        option_a: "They have learned to understand human traffic laws and signals.",
        option_b: "They are physically incapable of cracking walnuts using their beaks.",
        option_c: "They have adapted their foraging techniques to exploit human infrastructure.",
        option_d: "They prefer processed walnuts over other foods.",
        correct_answer: "C",
        explanation: "The crows dropping nuts in front of cars and using stoplights to safely retrieve them shows a highly specialized adaptation of foraging habits to utilize modern human cities.",
        difficulty: "Hard"
    },
    {
        subject: "Reading",
        topic: "Evidence",
        question_text: "Passage: A study found that employees who take brief, structured micro-breaks every hour report 25% higher focus and lower stress. However, unstructured browsing of social media during breaks did not yield any productivity or mental clarity benefits.\n\nWhich finding would best support the idea that micro-breaks must be structured to be effective?",
        option_a: "Employees taking micro-breaks to stretch had better focus than those browsing social media.",
        option_b: "Social media browsing triggers dopamine releases that block mental recovery.",
        option_c: "Employees who took no breaks reported the highest level of fatigue.",
        option_d: "Companies that banned phone usage during breaks saw profits rise.",
        correct_answer: "A",
        explanation: "Comparing employees who took a structured break (stretching) directly with those doing unstructured social browsing directly supports that structured break types are what yield the focus benefits.",
        difficulty: "Medium"
    },
    {
        subject: "Reading",
        topic: "Passage analysis",
        question_text: "Passage: The rise of digital ebooks was predicted to kill print books. However, print sales have remained resilient. Readers report that physical books provide a tactile satisfaction, freedom from screen fatigue, and a sense of ownership that digital formats cannot replicate.\n\nWhat is the passage's primary explanation for print's resilience?",
        option_a: "Ebook readers are too expensive for the average consumer.",
        option_b: "Physical books offer sensory and psychological benefits that digital files lack.",
        option_c: "Print publishers have cut prices to compete with ebooks.",
        option_d: "Libraries have stopped carrying digital ebooks due to licensing fees.",
        correct_answer: "B",
        explanation: "Print resilience is explained by tactile satisfaction (sensory benefit), no screen fatigue, and a sense of ownership (psychological benefits) that cannot be replicated digitally.",
        difficulty: "Hard"
    }
];

// Perform insertion
db.serialize(() => {
    db.run("DELETE FROM questions", (err) => {
        if (err) console.error("Error clearing questions table:", err.message);
    });

    const stmt = db.prepare(`
        INSERT INTO questions (
            subject, topic, question_text,
            option_a, option_b, option_c, option_d,
            correct_answer, explanation, difficulty
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    mockQuestions.forEach((q) => {
        stmt.run(
            q.subject,
            q.topic,
            q.question_text,
            q.option_a,
            q.option_b,
            q.option_c,
            q.option_d,
            q.correct_answer,
            q.explanation,
            q.difficulty
        );
    });

    stmt.finalize((err) => {
        if (err) {
            console.error("Seeding failed:", err.message);
        } else {
            console.log("Successfully seeded database with 20 SAT mock questions.");
        }
        db.close();
    });
});
