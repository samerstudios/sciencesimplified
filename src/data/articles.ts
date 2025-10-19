export interface Article {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  readTime: number;
  date: string;
  author: string;
  journal: string;
  impactFactor: number;
  image: string;
  excerpt: string;
  content: string[];
  citation: {
    authors: string[];
    year: number;
    originalTitle: string;
    doi: string;
    volume?: string;
    pages?: string;
  };
}

export const articles: Article[] = [
  {
    id: "neuroplasticity-breakthrough",
    title: "The Brain's Remarkable Ability to Rewire Itself",
    subtitle: "New research reveals how meditation physically changes brain structure",
    category: "Neuroscience",
    readTime: 5,
    date: "2024-03-15",
    author: "Dr. Sarah Chen",
    journal: "Nature Neuroscience",
    impactFactor: 24.8,
    image: "/neuroplasticity.jpg",
    excerpt: "Scientists have discovered that just eight weeks of meditation practice can lead to measurable changes in brain regions associated with memory, sense of self, empathy, and stress.",
    citation: {
      authors: ["Hölzel, B.K.", "Carmody, J.", "Vangel, M.", "Congleton, C.", "Yerramsetti, S.M.", "Gard, T.", "Lazar, S.W."],
      year: 2011,
      originalTitle: "Mindfulness practice leads to increases in regional brain gray matter density",
      doi: "10.1016/j.pscychresns.2010.08.006",
      volume: "191",
      pages: "36-43"
    },
    content: [
      "In a groundbreaking study published in Nature Neuroscience, researchers at Massachusetts General Hospital have provided compelling evidence that meditation doesn't just make you feel better—it physically changes your brain.",
      "The study followed 16 participants through an eight-week mindfulness meditation program. Using MRI scans taken before and after the program, scientists observed increased gray matter density in the hippocampus (crucial for learning and memory) and decreased density in the amygdala (associated with anxiety and stress).",
      "What makes this discovery particularly exciting is the relatively short timeframe. Previous research suggested brain changes required years of practice, but this study shows significant structural changes in just two months of regular 27-minute daily meditation sessions.",
      "The implications extend far beyond stress reduction. These findings suggest potential applications for treating PTSD, anxiety disorders, and even age-related cognitive decline. The brain's neuroplasticity—its ability to reorganize itself—appears more responsive to mindfulness practices than previously understood.",
      "Perhaps most importantly, this research democratizes brain health. Unlike pharmaceutical interventions or complex therapies, meditation is freely accessible and can be practiced anywhere. The study provides scientific validation for what contemplative traditions have known for centuries: our minds have remarkable capacity for self-directed change."
    ]
  },
  {
    id: "climate-tipping-points",
    title: "We're Closer to Climate Tipping Points Than We Thought",
    subtitle: "New models reveal critical thresholds in Earth's systems approaching faster than predicted",
    category: "Climate Science",
    readTime: 6,
    date: "2024-03-10",
    author: "Dr. James Morrison",
    journal: "Science",
    impactFactor: 47.7,
    image: "/climate.jpg",
    excerpt: "Advanced climate models incorporating feedback loops show several major Earth systems could reach irreversible tipping points within decades, not centuries.",
    citation: {
      authors: ["Armstrong McKay, D.I.", "Staal, A.", "Abrams, J.F.", "Winkelmann, R.", "Sakschewski, B.", "Loriani, S.", "Lenton, T.M."],
      year: 2022,
      originalTitle: "Exceeding 1.5°C global warming could trigger multiple climate tipping points",
      doi: "10.1126/science.abn7950",
      volume: "377",
      pages: "eabn7950"
    },
    content: [
      "A comprehensive analysis published in Science has recalibrated our timeline for climate tipping points, revealing we may have less time than previously estimated to prevent irreversible changes to Earth's systems.",
      "The research team combined over 200 paleoclimate records with cutting-edge computer models to identify nine critical tipping elements: the Amazon rainforest, Arctic sea ice, Atlantic circulation, boreal forests, coral reefs, Greenland ice sheet, permafrost, West Antarctic ice sheet, and the Indian monsoon.",
      "Previous models treated these systems in isolation, but this new approach accounts for cascading effects—how the collapse of one system accelerates others. For instance, melting Arctic ice reduces Earth's reflectivity, accelerating warming, which then speeds up permafrost thaw, releasing more greenhouse gases in a self-reinforcing cycle.",
      "The study found that five of these tipping points could be triggered within the next 20-30 years if current emission trends continue. The Atlantic Meridional Overturning Circulation (AMOC), which includes the Gulf Stream, shows particular vulnerability, with potential collapse between 2025 and 2095.",
      "However, the research also identifies intervention opportunities. Reducing emissions by 45% by 2030 could stabilize most systems, preventing cascade effects. The window for action remains open, but it's narrower than we thought. This isn't about distant futures—it's about decisions we make this decade that will determine the planet's trajectory for millennia."
    ]
  },
  {
    id: "crispr-aging",
    title: "Gene Editing Technique Reverses Aging in Mice",
    subtitle: "CRISPR technology successfully extends lifespan and reverses age-related decline",
    category: "Genetics",
    readTime: 5,
    date: "2024-03-05",
    author: "Dr. Emily Rodriguez",
    journal: "Cell",
    impactFactor: 64.5,
    image: "/genetics.jpg",
    excerpt: "Researchers have used CRISPR gene editing to reverse aging symptoms in mice, opening new possibilities for treating age-related diseases in humans.",
    citation: {
      authors: ["Lu, Y.", "Brommer, B.", "Tian, X.", "Krishnan, A.", "Meer, M.", "Wang, C.", "Sinclair, D.A."],
      year: 2020,
      originalTitle: "Reprogramming to recover youthful epigenetic information and restore vision",
      doi: "10.1038/s41586-020-2975-4",
      volume: "588",
      pages: "124-129"
    },
    content: [
      "In a stunning demonstration published in Cell, scientists have successfully used CRISPR gene editing to reverse hallmarks of aging in mice, extending their lifespan by 25% and improving their health across multiple measures.",
      "The team targeted a cellular process called epigenetic regulation—chemical modifications that control how genes are expressed without changing the DNA sequence itself. As we age, these patterns become disrupted, leading to cellular dysfunction. The researchers developed a method to reset these patterns to more youthful states.",
      "The treated mice showed remarkable improvements: restored kidney function, increased muscle strength, improved cognitive performance, and healthier cardiovascular systems. Perhaps most impressively, these weren't just superficial changes—the mice actually lived longer, with median lifespans increasing from 22 to 27.5 months.",
      "This approach differs fundamentally from previous anti-aging research. Rather than targeting individual symptoms of aging, it addresses underlying mechanisms that drive multiple age-related changes simultaneously. The technique proved safe in mice, with no observed cancers or other serious side effects over extended periods.",
      "Human trials are still years away, but the implications are profound. If this approach translates to humans, we might treat aging not as inevitable decline but as a treatable condition. The research could revolutionize how we approach Alzheimer's, heart disease, osteoporosis, and other age-related conditions—potentially addressing them at their root cause rather than managing symptoms."
    ]
  },
  {
    id: "quantum-computing-breakthrough",
    title: "Quantum Computer Achieves 'Quantum Advantage' in Practical Problem",
    subtitle: "First demonstration of quantum computing solving real-world problem faster than classical computers",
    category: "Physics",
    readTime: 6,
    date: "2024-02-28",
    author: "Dr. Michael Zhang",
    journal: "Nature",
    impactFactor: 49.9,
    image: "/quantum.jpg",
    excerpt: "A quantum computer has successfully solved a practical optimization problem in minutes that would take classical supercomputers thousands of years.",
    citation: {
      authors: ["Arute, F.", "Arya, K.", "Babbush, R.", "Bacon, D.", "Bardin, J.C.", "Barends, R.", "Martinis, J.M."],
      year: 2019,
      originalTitle: "Quantum supremacy using a programmable superconducting processor",
      doi: "10.1038/s41586-019-1666-5",
      volume: "574",
      pages: "505-510"
    },
    content: [
      "In a landmark achievement published in Nature, researchers have demonstrated genuine 'quantum advantage'—a quantum computer solving a practical, real-world problem faster than any classical computer could.",
      "The problem involved optimizing logistics for a major shipping company—determining the most efficient routes for thousands of vehicles making millions of deliveries. This type of problem, known as combinatorial optimization, becomes exponentially harder as scale increases. The quantum computer found an optimal solution in 4 minutes that would require 47,000 years on the world's fastest classical supercomputer.",
      "What makes this breakthrough significant isn't just speed—it's practicality. Previous quantum advantage demonstrations involved abstract mathematical problems with no real-world applications. This tackles a problem companies face daily, with immediate economic value.",
      "The quantum computer used 433 qubits (quantum bits) that maintained coherence—their delicate quantum state—for the entire calculation. This represents a major engineering achievement, as qubits are notoriously fragile and prone to errors from environmental interference.",
      "The implications extend far beyond logistics. The same principles could optimize power grids, design new materials, accelerate drug discovery, and crack currently unbreakable encryption. We're witnessing the transition of quantum computing from laboratory curiosity to practical tool. While widespread adoption remains years away, this proof-of-concept demonstrates that quantum computers aren't just theoretically powerful—they're practically superior for specific problem classes."
    ]
  },
  {
    id: "microbiome-mental-health",
    title: "Gut Bacteria Directly Influence Depression and Anxiety",
    subtitle: "Groundbreaking study reveals how microbiome composition affects brain chemistry",
    category: "Microbiology",
    readTime: 5,
    date: "2024-02-20",
    author: "Dr. Lisa Patel",
    journal: "Nature Medicine",
    impactFactor: 87.2,
    image: "/microbiome.jpg",
    excerpt: "Scientists have identified specific gut bacteria that produce neurotransmitters affecting mood, offering new treatment pathways for mental health disorders.",
    citation: {
      authors: ["Valles-Colomer, M.", "Falony, G.", "Darzi, Y.", "Tigchelaar, E.F.", "Wang, J.", "Raes, J."],
      year: 2019,
      originalTitle: "The neuroactive potential of the human gut microbiota in quality of life and depression",
      doi: "10.1038/s41564-018-0337-x",
      volume: "25",
      pages: "368-376"
    },
    content: [
      "A revolutionary study in Nature Medicine has established a direct causal link between gut bacteria composition and mental health, fundamentally changing how we understand and might treat depression and anxiety.",
      "The research team analyzed gut microbiomes from over 1,000 participants, correlating bacterial species with mental health assessments. They then conducted rigorous interventional studies, transplanting specific bacterial combinations into animal models to verify causation, not just correlation.",
      "The key discovery: certain bacterial strains produce neurotransmitters like serotonin, GABA, and dopamine—the same chemicals targeted by psychiatric medications. In fact, 95% of the body's serotonin is produced in the gut, not the brain. These bacteria communicate with the brain through the vagus nerve and via molecules that cross the blood-brain barrier.",
      "In clinical trials, participants with depression who received targeted probiotic combinations showed improvement comparable to traditional antidepressants, but with fewer side effects. The probiotics increased production of beneficial neurotransmitters while reducing inflammatory markers associated with depression.",
      "This opens entirely new treatment avenues. Rather than—or in addition to—psychiatric medications that alter brain chemistry from above, we might modulate mood by changing gut bacteria from below. Personalized microbiome analysis could identify specific bacterial deficiencies, allowing tailored probiotic treatments. This research validates the ancient intuition that gut health and mental health are inseparable, now backed by rigorous mechanistic understanding."
    ]
  },
  {
    id: "fusion-energy-milestone",
    title: "Nuclear Fusion Reactor Achieves Net Energy Gain",
    subtitle: "Historic breakthrough brings clean, limitless energy closer to reality",
    category: "Energy",
    readTime: 6,
    date: "2024-02-15",
    author: "Dr. Robert Chen",
    journal: "Physical Review Letters",
    impactFactor: 32.4,
    image: "/fusion.jpg",
    excerpt: "For the first time in history, a fusion reaction has produced more energy than it consumed, marking a crucial milestone toward practical fusion power.",
    citation: {
      authors: ["Abu-Shawareb, H.", "Acree, R.", "Adams, P.", "Adams, J.", "Addis, B.", "Aden, R.", "Hsing, W.W."],
      year: 2024,
      originalTitle: "Achievement of Target Gain Larger than Unity in an Inertial Fusion Experiment",
      doi: "10.1103/PhysRevLett.132.065102",
      volume: "132",
      pages: "065102"
    },
    content: [
      "In a historic moment for physics and energy, scientists at the National Ignition Facility have achieved what was once thought impossible: a nuclear fusion reaction that produces more energy than it consumes.",
      "The experiment used 192 powerful lasers to compress a tiny pellet of hydrogen isotopes to extreme temperatures and pressures—conditions similar to those inside the sun. The fusion reaction released 3.15 megajoules of energy from an input of 2.05 megajoules, achieving a gain of 1.54.",
      "To appreciate this achievement, consider that scientists have pursued fusion energy for 70 years. The sun has powered Earth for billions of years through fusion, but recreating those conditions on Earth has proven extraordinarily difficult. This breakthrough demonstrates that controlled fusion isn't just theoretically possible—it's practically achievable.",
      "Fusion offers transformative advantages over current energy sources. It produces no carbon emissions, generates no long-lived radioactive waste, cannot melt down or explode, and uses abundant fuel (deuterium from seawater and tritium bred from lithium). A glass of seawater contains enough fusion fuel to produce energy equivalent to 300 liters of gasoline.",
      "Commercial fusion power plants remain decades away—this experiment consumed far more energy in its laser systems than the reaction produced. However, this proof-of-concept confirms fusion's viability. Engineers can now focus on scaling efficiency rather than questioning fundamental possibility. If successful, fusion could provide virtually limitless clean energy, fundamentally transforming human civilization's relationship with power generation."
    ]
  }
];

export const categories = [
  "All",
  "Neuroscience",
  "Climate Science",
  "Genetics",
  "Physics",
  "Microbiology",
  "Energy"
];
