/* LaLa-World — speaker script (one entry per slide, in slide order).
   Edit the text between the backticks, save, and reload index.html: the presenter window (p) shows it
   right away.  [click] = where the next click lands while you speak.
   Lines starting with ※ are cues for you only.  A rebuild keeps whatever is written here. */
window.DECK_NOTES = window.DECK_NOTES || {};
var N = window.DECK_NOTES;

// 1. Title  (18 s)
N['title'] = `
Today I will talk about LaLa-World.
We use language to train latent world models across domains, then transfer that knowledge to a policy.
`;

// 2. World Models  (9 s)
N['sec-world-models'] = `
Let me first explain what I mean by a world model.
`;

// 3. Acting and Imagining Together  (24 s, 3 clicks)
N['acting'] = `
When we act, we also imagine the outcome.
[click] Push the cup right, and we expect it to move.
[click] Keep pushing, and it may fall.
[click] World-model research aims to give machines this ability.
`;

// 4. What Is a World Model?  (41 s, 3 clicks)
N['brain'] = `
We can separate this into three roles.
The actor chooses what to do.
[click] The world model imagines the result of that action.
[click] The critic judges whether that result is good or bad.
[click] Existing methods like DreamerV3, Muzero, and TD-MPC2 combine these parts and learn with rewards.
The critic's value helps guide action selection.
`;

// 5. JEPA-Style Latent World Models  (30 s, 1 click)
N['jepa'] = `
Other work focuses on the world model, such as DINO-WM, LeWorldModel.
We call this the JEPA-style setting.
[click] This is our focus.
Here, given the current latent and an action, we predict the future latent.
`;

// 6. The Data behind Latent World Models  (12 s, 2 clicks)
N['data'] = `
The training data are simple: a current image,
[click] an action vector,
[click] and a future image.
`;

// 7. The Usual Numerical-Action Predictor  (35 s, 3 clicks)
N['numerical-predictor'] = `
A vision encoder reads the image.
[click] An MLP embeds the action vector.
[click] A Transformer uses both to predict the future latent.
[click] This setup has two limits.
It needs control data with action labels.
The action interface also ties the model to a fixed set of domains.
`;

// 8. Actions Differ across Domains  (24 s, 3 clicks)
N['domains'] = `
For example, these two actions have two numbers, but different meanings: movement here, force here.
[click] Robot actions need more dimensions.
[click] Web videos have no such vectors.
[click] So each domain gets its own predictor.
`;

// 9. Generative World Models  (6 s)
N['sec-generative'] = `
Generative world models suggest another way.
`;

// 10. What We Mean by Generative World Models  (15 s, 2 clicks)
N['video-generation'] = `
By generative world models, I mean video generation models, such as Cosmos-Predict2.
[click] The model takes the current frame and a text prompt,
[click] and turns video noise into future frames.
`;

// 11. Language Describes Visual Change  (14 s, 1 click)
N['language-change'] = `
Generative models use language to describe change.
The condition can be a video caption
[click] or an image-edit instruction.
`;

// 12. A Broad Visual Prior  (14 s, 1 click)
N['visual-prior'] = `
This lets one model learn from many kinds of visual data.
[click] Can this knowledge help a robot act?
`;

// 13. Video Pretraining Can Support Policy Learning  (25 s, 2 clicks)
N['cosmos'] = `
Cosmos-Predict2 learns to generate future frames from visual data and language.
[click] Cosmos Policy fine-tunes that model
[click] to predict actions and future frames together.
It shows that video pretraining can help policy learning.
`;

// 14. LaLa-World  (7 s)
N['sec-lala-world'] = `
We study the same idea in latent space.
`;

// 15. Language as a Shared Action Interface  (50 s, 3 clicks)
N['language-interface'] = `
Our first idea is to describe each action in words.
[click] We keep direction and magnitude, but also state what they mean: move a pusher, apply a force, or rotate a gripper.
[click] A video caption now fits the same interface.
We no longer need an action vector for every training example.
[click] All these descriptions become the same kind of condition.
One predictor can learn across domains.
`;

// 16. Scaling Training Data for Latent World Models  (21 s, 1 click)
N['scaling-data'] = `
Language opens a way to scale latent world models
[click] with images and videos.
We keep the efficiency of latent prediction.
This branch needs no future pixels or denoising.
`;

// 17. LaLa-World Architecture  (45 s, 3 clicks)
N['lala-architecture'] = `
Here is the model.
A frozen vision encoder first turns the current image into visual features.
[click] We feed these features and the language condition into a pretrained language model.
[click] We also add learned queries for the future.
The model predicts all future features in one pass.
[click] We train them to match the features of the actual future image.
`;

// 18. Fine-Tuning LaLa-World into LaLa-Policy  (31 s, 3 clicks)
N['lala-policy-architecture'] = `
Next, we use LaLa-World to initialize a policy.
We keep its future prediction branch.
[click] We add action queries and an action generator.
[click] It turns noise into an action chunk.
[click] Now the policy predicts both an action and its future outcome.
`;

// 19. LaLa-World Results  (6 s)
N['sec-results-world'] = `
First, does LaLa-World help us plan?
`;

// 20. Planning toward a Goal Image  (20 s, 1 click)
N['goal'] = `
We start with an image and a goal image.
[click] The task is to find actions that reach the goal.
Let me briefly walk through how we plan with MPC and CEM.
※ If the audience already knows MPC/CEM: press Shift+→ twice to skip the MPC walkthrough and land on the benchmark chart.
`;

// 21. MPC with a latent world model  (58 s, 3 clicks)
N['mpc'] = `
We sample many action sequences and describe each one in language.
[click] The world model imagines the future for every candidate sequence.
[click] We encode the goal image too.
Then we compare each predicted latent with the goal latent using L2 distance.
A smaller distance means a better candidate.
[click] CEM keeps good candidates and samples again around them.
MPC executes the first part of the chosen sequence.
Then we observe the result and plan again.
※ Diagram shows 3 candidates; the experiments use 300 per CEM iteration.
`;

// 22. Planning across Five Shared Benchmarks  (17 s)
N['planning-chart'] = `
On the five shared benchmarks, LaLa-World reaches 72.1 percent average success.
It performs better than the other latent world models shown here.
※ Mean success rate on Wall, PointMaze, Push-T, MetaWorld-R and MetaWorld-RW; best encoder per benchmark.
`;

// 23. Selected Actions in Wall  (17 s)
N['wall-video'] = `
Here is the selected action sequence running in the Wall simulator.
※ The clip plays at 1.4× speed. Press r to restart it.
`;

// 24. Selected Actions in Push-T  (16 s)
N['pusht-video'] = `
This is Push-T, also using numerical language actions.
※ The clip plays at 1.4× speed. Press r to restart it.
`;

// 25. Selected Actions in PointMaze  (18 s)
N['pointmaze-video'] = `
Now the language uses only rough directions and strengths.
This is PointMaze.
※ The clip plays at 1.4× speed. Press r to restart it.
`;

// 26. Selected Actions in Rope  (15 s)
N['rope-video'] = `
Here is the same idea in Rope.
※ The clip plays at 1.4× speed. Press r to restart it.
`;

// 27. LaLa-Policy Results  (6 s)
N['sec-results-policy'] = `
Now, does this knowledge help policy learning?
`;

// 28. How the Policy Recipes Differ  (15 s, 1 click)
N['policy-recipes'] = `
A typical VLA predicts actions.
[click] Our goal is to predict their consequences too, as we do when we act.
`;

// 29. How the Policy Recipes Differ  (18 s, 2 clicks)
N['policy-table'] = `
※ Header and the VLA row are already up.
[click] Cosmos Policy predicts actions and future frames.
[click] LaLa-Policy predicts actions and future latents.
Both learn action prediction from a model of the future.
`;

// 30. World-Model Pretraining Transfers to Policy Learning  (16 s)
N['robocasa-chart'] = `
On RoboCasa, LaLa-World pretraining improves success from 55.5 to 57.3 percent.
It also performs better than the baselines shown here.
※ RoboCasa: ~50 human demonstrations per task. Cosmos Policy here is the adapted baseline (actions + future observations only).
`;

// 31. Faster Policy Inference  (13 s)
N['speed-chart'] = `
On RoboCasa, total model inference time per trajectory is about five and a half times lower than Cosmos Policy.
※ Average model inference time per trajectory, in seconds (lower is better): 2.12 s vs 11.71 s. Cosmos Policy = adapted baseline.
`;

// 32. Acting and Anticipating Together  (14 s, 1 click)
N['anticipate'] = `
The policy takes an observation and an instruction.
[click] It predicts an action chunk and a future latent together.
`;

// 33. Acting and Anticipating Together  (28 s, 3 clicks)
N['anticipate-layout'] = `
※ The equation and the video layout are up; the arrows come with the clicks.
[click] We execute the actions in the simulator.
[click] A decoder turns the predicted latent into an image so we can view it.
The decoder is only for visualization.
[click] Compare the top and bottom views at the same future time.
`;

// 34. LIBERO: Bowl to Plate  (18 s)
N['libero-plate'] = `
In LIBERO, the robot moves the bowl onto the plate.
※ Press r to restart the clip.
`;

// 35. LIBERO: Bowl to Cabinet  (16 s)
N['libero-cabinet'] = `
Here it places the bowl on the cabinet.
※ Press r to restart the clip.
`;

// 36. RoboCasa: Serve Coffee  (15 s)
N['robocasa-coffee'] = `
In RoboCasa, it presses the coffee machine button.
※ Press r to restart the clip.
`;

// 37. RoboCasa: Open the Microwave  (26 s)
N['robocasa-microwave'] = `
Here it opens the microwave.
The lower views show the future predicted before the action.
※ This clip plays at 1.25× source speed.
※ Press r to restart the clip.
`;

// 38. Future Directions  (12 s)
N['sec-future'] = `
Let me finish with the next steps.
`;

// 39. Extending the Current Work  (28 s, 3 clicks)
N['extensions'] = `
I see three direct extensions.
[click] First, scale the data and model.
[click] Second, train the vision encoder together with the predictor.
[click] Third, test on real robots.
I want to understand which changes improve both future prediction and action performance.
`;

// 40. Robotics Grows with Agents  (45 s, 3 clicks)
N['agents'] = `
I also expect robotics to grow with AI agents.
Here, a user asks for a painting
[click] and a robot acts.
This connects an open-ended request to the physical world.
[click] How can the system improve after an attempt?
It could check the result, remember what failed, and change its next action.
[click] A world model may help it test choices before acting.
`;

// 41. Research Questions at the Agent–Robot Interface  (28 s, 3 clicks)
N['questions'] = `
We could build a benchmark for longer tasks and repeated attempts.
[click] We could use world models to check actions,
[click] add memory across tasks,
[click] or learn from failures.
These are the directions I find most exciting.
`;

// 42. Thank you  (10 s)
N['thanks'] = `
Thank you.
I'm happy to take questions.
`;
