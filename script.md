# LaLa-World — speaker script

Talk plan 14:56 · 42 slides · 51 clicks. **▶** = click (next build). Lines starting with ※ are cues, not script.

## 1. Title
*starts 0:00 · 18 s · `#title`*

Today I will talk about LaLa-World.  
We use language to train latent world models across domains, then transfer that knowledge to a policy.  

## 2. World Models
*starts 0:18 · 9 s · `#sec-world-models`*

Let me first explain what I mean by a world model.  

## 3. Acting and Imagining Together
*starts 0:27 · 24 s · 3 clicks · `#acting`*

When we act, we also imagine the outcome.  
**▶** Push the cup right, and we expect it to move.  
**▶** Keep pushing, and it may fall.  
**▶** World-model research aims to give machines this ability.  

## 4. What Is a World Model?
*starts 0:51 · 41 s · 3 clicks · `#brain`*

We can separate this into three roles.  
The actor chooses what to do.  
**▶** The world model imagines the result of that action.  
**▶** The critic judges whether that result is good or bad.  
**▶** Existing methods like DreamerV3, Muzero, and TD-MPC2 combine these parts and learn with rewards.  
The critic's value helps guide action selection.  

## 5. JEPA-Style Latent World Models
*starts 1:32 · 30 s · 1 click · `#jepa`*

Other work focuses on the world model, such as DINO-WM, LeWorldModel.  
We call this the JEPA-style setting.  
**▶** This is our focus.  
Here, given the current latent and an action, we predict the future latent.  

## 6. The Data behind Latent World Models
*starts 2:02 · 12 s · 2 clicks · `#data`*

The training data are simple: a current image,  
**▶** an action vector,  
**▶** and a future image.  

## 7. The Usual Numerical-Action Predictor
*starts 2:14 · 35 s · 3 clicks · `#numerical-predictor`*

A vision encoder reads the image.  
**▶** An MLP embeds the action vector.  
**▶** A Transformer uses both to predict the future latent.  
**▶** This setup has two limits.  
It needs control data with action labels.  
The action interface also ties the model to a fixed set of domains.  

## 8. Actions Differ across Domains
*starts 2:49 · 24 s · 3 clicks · `#domains`*

For example, these two actions have two numbers, but different meanings: movement here, force here.  
**▶** Robot actions need more dimensions.  
**▶** Web videos have no such vectors.  
**▶** So each domain gets its own predictor.  

## 9. Generative World Models
*starts 3:13 · 6 s · `#sec-generative`*

Generative world models suggest another way.  

## 10. What We Mean by Generative World Models
*starts 3:19 · 15 s · 2 clicks · `#video-generation`*

By generative world models, I mean video generation models, such as Cosmos-Predict2.  
**▶** The model takes the current frame and a text prompt,  
**▶** and turns video noise into future frames.  

## 11. Language Describes Visual Change
*starts 3:34 · 14 s · 1 click · `#language-change`*

Generative models use language to describe change.  
The condition can be a video caption  
**▶** or an image-edit instruction.  

## 12. A Broad Visual Prior
*starts 3:48 · 14 s · 1 click · `#visual-prior`*

This lets one model learn from many kinds of visual data.  
**▶** Can this knowledge help a robot act?  

## 13. Video Pretraining Can Support Policy Learning
*starts 4:02 · 25 s · 2 clicks · `#cosmos`*

Cosmos-Predict2 learns to generate future frames from visual data and language.  
**▶** Cosmos Policy fine-tunes that model  
**▶** to predict actions and future frames together.  
It shows that video pretraining can help policy learning.  

## 14. LaLa-World
*starts 4:27 · 7 s · `#sec-lala-world`*

We study the same idea in latent space.  

## 15. Language as a Shared Action Interface
*starts 4:34 · 50 s · 3 clicks · `#language-interface`*

Our first idea is to describe each action in words.  
**▶** We keep direction and magnitude, but also state what they mean: move a pusher, apply a force, or rotate a gripper.  
**▶** A video caption now fits the same interface.  
We no longer need an action vector for every training example.  
**▶** All these descriptions become the same kind of condition.  
One predictor can learn across domains.  

## 16. Scaling Training Data for Latent World Models
*starts 5:24 · 21 s · 1 click · `#scaling-data`*

Language opens a way to scale latent world models  
**▶** with images and videos.  
We keep the efficiency of latent prediction.  
This branch needs no future pixels or denoising.  

## 17. LaLa-World Architecture
*starts 5:45 · 45 s · 3 clicks · `#lala-architecture`*

Here is the model.  
A frozen vision encoder first turns the current image into visual features.  
**▶** We feed these features and the language condition into a pretrained language model.  
**▶** We also add learned queries for the future.  
The model predicts all future features in one pass.  
**▶** We train them to match the features of the actual future image.  

## 18. Fine-Tuning LaLa-World into LaLa-Policy
*starts 6:30 · 31 s · 3 clicks · `#lala-policy-architecture`*

Next, we use LaLa-World to initialize a policy.  
We keep its future prediction branch.  
**▶** We add action queries and an action generator.  
**▶** It turns noise into an action chunk.  
**▶** Now the policy predicts both an action and its future outcome.  

## 19. LaLa-World Results
*starts 7:01 · 6 s · `#sec-results-world`*

First, does LaLa-World help us plan?  

## 20. Planning toward a Goal Image
*starts 7:07 · 20 s · 1 click · `#goal`*

We start with an image and a goal image.  
**▶** The task is to find actions that reach the goal.  
Let me briefly walk through how we plan with MPC and CEM.  
※ If the audience already knows MPC/CEM: press Shift+→ twice to skip the MPC walkthrough and land on the benchmark chart.  

## 21. MPC with a latent world model
*starts 7:27 · 58 s · 3 clicks · `#mpc`*

We sample many action sequences and describe each one in language.  
**▶** The world model imagines the future for every candidate sequence.  
**▶** We encode the goal image too.  
Then we compare each predicted latent with the goal latent using L2 distance.  
A smaller distance means a better candidate.  
**▶** CEM keeps good candidates and samples again around them.  
MPC executes the first part of the chosen sequence.  
Then we observe the result and plan again.  
※ Diagram shows 3 candidates; the experiments use 300 per CEM iteration.  

## 22. Planning across Five Shared Benchmarks
*starts 8:25 · 17 s · `#planning-chart`*

On the five shared benchmarks, LaLa-World reaches 72.1 percent average success.  
It performs better than the other latent world models shown here.  
※ Mean success rate on Wall, PointMaze, Push-T, MetaWorld-R and MetaWorld-RW; best encoder per benchmark.  

## 23. Selected Actions in Wall
*starts 8:42 · 17 s · `#wall-video`*

Here is the selected action sequence running in the Wall simulator.  
※ The clip plays at 1.4× speed. Press r to restart it.  

## 24. Selected Actions in Push-T
*starts 8:59 · 16 s · `#pusht-video`*

This is Push-T, also using numerical language actions.  
※ The clip plays at 1.4× speed. Press r to restart it.  

## 25. Selected Actions in PointMaze
*starts 9:15 · 18 s · `#pointmaze-video`*

Now the language uses only rough directions and strengths.  
This is PointMaze.  
※ The clip plays at 1.4× speed. Press r to restart it.  

## 26. Selected Actions in Rope
*starts 9:33 · 15 s · `#rope-video`*

Here is the same idea in Rope.  
※ The clip plays at 1.4× speed. Press r to restart it.  

## 27. LaLa-Policy Results
*starts 9:48 · 6 s · `#sec-results-policy`*

Now, does this knowledge help policy learning?  

## 28. How the Policy Recipes Differ
*starts 9:54 · 15 s · 1 click · `#policy-recipes`*

A typical VLA predicts actions.  
**▶** Our goal is to predict their consequences too, as we do when we act.  

## 29. How the Policy Recipes Differ
*starts 10:09 · 18 s · 2 clicks · `#policy-table`*

※ Header and the VLA row are already up.  
**▶** Cosmos Policy predicts actions and future frames.  
**▶** LaLa-Policy predicts actions and future latents.  
Both learn action prediction from a model of the future.  

## 30. World-Model Pretraining Transfers to Policy Learning
*starts 10:27 · 16 s · `#robocasa-chart`*

On RoboCasa, LaLa-World pretraining improves success from 55.5 to 57.3 percent.  
It also performs better than the baselines shown here.  
※ RoboCasa: ~50 human demonstrations per task. Cosmos Policy here is the adapted baseline (actions + future observations only).  

## 31. Faster Policy Inference
*starts 10:43 · 13 s · `#speed-chart`*

On RoboCasa, total model inference time per trajectory is about five and a half times lower than Cosmos Policy.  
※ Average model inference time per trajectory, in seconds (lower is better): 2.12 s vs 11.71 s. Cosmos Policy = adapted baseline.  

## 32. Acting and Anticipating Together
*starts 10:56 · 14 s · 1 click · `#anticipate`*

The policy takes an observation and an instruction.  
**▶** It predicts an action chunk and a future latent together.  

## 33. Acting and Anticipating Together
*starts 11:10 · 28 s · 3 clicks · `#anticipate-layout`*

※ The equation and the video layout are up; the arrows come with the clicks.  
**▶** We execute the actions in the simulator.  
**▶** A decoder turns the predicted latent into an image so we can view it.  
The decoder is only for visualization.  
**▶** Compare the top and bottom views at the same future time.  

## 34. LIBERO: Bowl to Plate
*starts 11:38 · 18 s · `#libero-plate`*

In LIBERO, the robot moves the bowl onto the plate.  
※ Press r to restart the clip.  

## 35. LIBERO: Bowl to Cabinet
*starts 11:56 · 16 s · `#libero-cabinet`*

Here it places the bowl on the cabinet.  
※ Press r to restart the clip.  

## 36. RoboCasa: Serve Coffee
*starts 12:12 · 15 s · `#robocasa-coffee`*

In RoboCasa, it presses the coffee machine button.  
※ Press r to restart the clip.  

## 37. RoboCasa: Open the Microwave
*starts 12:27 · 26 s · `#robocasa-microwave`*

Here it opens the microwave.  
The lower views show the future predicted before the action.  
※ This clip plays at 1.25× source speed.  
※ Press r to restart the clip.  

## 38. Future Directions
*starts 12:53 · 12 s · `#sec-future`*

Let me finish with the next steps.  

## 39. Extending the Current Work
*starts 13:05 · 28 s · 3 clicks · `#extensions`*

I see three direct extensions.  
**▶** First, scale the data and model.  
**▶** Second, train the vision encoder together with the predictor.  
**▶** Third, test on real robots.  
I want to understand which changes improve both future prediction and action performance.  

## 40. Robotics Grows with Agents
*starts 13:33 · 45 s · 3 clicks · `#agents`*

I also expect robotics to grow with AI agents.  
Here, a user asks for a painting  
**▶** and a robot acts.  
This connects an open-ended request to the physical world.  
**▶** How can the system improve after an attempt?  
It could check the result, remember what failed, and change its next action.  
**▶** A world model may help it test choices before acting.  

## 41. Research Questions at the Agent–Robot Interface
*starts 14:18 · 28 s · 3 clicks · `#questions`*

We could build a benchmark for longer tasks and repeated attempts.  
**▶** We could use world models to check actions,  
**▶** add memory across tasks,  
**▶** or learn from failures.  
These are the directions I find most exciting.  

## 42. Thank you
*starts 14:46 · 10 s · `#thanks`*

Thank you.  
I'm happy to take questions.
