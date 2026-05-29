export type HittingPdfSection = {
  id: string;
  title: string;
  image?: string;
  paragraphs: string[];
};

export const hittingPdfReport = {
  cover: {
    title: "Motion Capture Hitting Analysis",
    tagline: "Assess, Identify, & Let's Get After It",
    website: "www.sequencebiolab.com",
  },
  metadata: [
    { label: "Name", value: "Gavin Lux" },
    { label: "Location", value: "Tampa, FL" },
    { label: "Date", value: "5-27-2026" },
  ],
  findings: {
    title: "Hitter Sequence",
    paragraphs: [
      "The kinematic sequence is one of the most important characteristics of an efficient swing. In elite hitters, rotation is initiated from the ground up, beginning with the pelvis, followed by the torso, and finally the arms and barrel. This proximal-to-distal sequence allows energy to be transferred efficiently throughout the kinetic chain while maximizing the contribution of the stretch-shortening cycle.",
      "A key component of this process is the relationship between the pelvis and torso. As the pelvis begins rotating underneath a relatively stable torso, tension is created across the core musculature, which serves as the primary link between the lower and upper halves. Because the abdominal and oblique muscles attach to both the pelvis and rib cage, they play a critical role in creating separation, storing elastic energy, and transferring force throughout the swing.",
      "Gavin demonstrates many of the foundational movement characteristics commonly observed in elite hitters. He consistently achieves efficient positions throughout the loading and acceleration phases and displays several of the mechanical attributes associated with high-level offensive performance. However, he does not consistently achieve the optimal kinematic sequence necessary to maximize energy transfer from the lower half into the barrel.",
      "This pattern may be influenced by his inability to effectively initiate rotation from the pelvis and create separation through pelvic rotation underneath a stable torso. As a result, portions of the upper body become more involved earlier in the sequence, reducing the efficiency of force transfer and limiting the amount of energy available to be expressed through the barrel at contact.",
      "A common challenge among hitters is the misconception that shoulder-to-hip separation is created by turning the torso farther away from the pitcher. In reality, many elite hitters create separation by rotating the pelvis underneath a relatively fixed torso. This strategy allows the acceleration phase to begin proximally, creating the proper sequencing necessary for the swing to unfold distally through the torso, arms, and barrel.",
      "Improving Gavin's ability to initiate rotation from the pelvis and maintain a stable torso during the early stages of acceleration may enhance his sequencing, improve energy transfer, and allow him to more consistently access the high-level movement qualities already present within his swing.",
    ],
    optimalSequence: "Pelvis Rotation → Torso Rotation → Arm Extension",
    athleteSequence: "Pelvic Rotation → Torso Rotation → Arm Extension",
  },
  kpiHeading: "Key Performance indicators",
  sections: [
    {
      id: "shoulder-hip-separation",
      title: "Shoulder Hip Separation",
      image: "/hitting/shoulder-hip-separation.png",
      paragraphs: [
        "Shoulder-to-hip separation is an important performance metric because it reflects a hitter's ability to create and utilize the stretch-shortening cycle throughout the swing. In many cases, effective separation is an indication that the athlete has sequenced efficiently up to that point, allowing energy to be stored and transferred through the kinetic chain.",
        "Gavin demonstrates a relatively limited degree of shoulder-to-hip separation; however, he creates separation using an efficient movement strategy by allowing the pelvis to rotate underneath a relatively stable torso. This is an important distinction, as some hitters create separation by rotating the torso over a closed pelvis rather than rotating the pelvis underneath the trunk. While this may produce measurable separation, it often increases the time required to get the barrel into the hitting zone and can contribute to premature trunk rotation.",
        "Gavin's ability to create separation from the ground up demonstrates an efficient rotational strategy; however, his limited pelvic rotation at landing may restrict the total amount of separation available to him. Because pelvic rotation serves as the foundation for creating separation, insufficient rotation into landing can limit the rotational stretch developed between the pelvis and torso and reduce the amount of energy available to be transferred through the swing.",
        "Improving pelvic rotation and lower-half rotational control may allow Gavin to create additional shoulder-to-hip separation while maintaining the efficient sequencing patterns already present in his swing. This could improve energy transfer, rotational efficiency, and overall offensive performance.",
      ],
    },
    {
      id: "shoulder-horizontal-adduction",
      title: "Shoulder Horizontal Adduction",
      image: "/hitting/shoulder-horizontal-adduction.png",
      paragraphs: [
        "Shoulder horizontal adduction of the lead arm is a critical component of an efficient swing and plays an important role in maintaining shoulder-to-hip separation throughout rotation. This movement is positively correlated with bat speed because it helps position the upper body to effectively utilize the stretch-shortening cycle and transfer energy from the lower half into the barrel.",
        "Gavin demonstrates an excellent degree of shoulder horizontal adduction during the swing. However, he is unable to maintain this position long enough to fully capitalize on the sequencing benefits it provides. Visually, this movement appears as the lead shoulder working toward the drive-side of the body while the pelvis continues rotating underneath the torso.",
        "Maintaining shoulder horizontal adduction deeper into the swing increases the demands placed on the oblique musculature and enhances the rotational stretch created between the upper and lower body. This stretch-shortening relationship is a key contributor to rotational power and efficient energy transfer. A useful way to visualize this position is by rotating the sternum toward the lead armpit while allowing the pelvis to continue rotating underneath a relatively stable torso.",
        "When horizontal adduction is lost too early, the upper body may begin rotating prematurely, increasing the rotational arc of the barrel and creating what is commonly referred to as barrel drag. This can negatively affect bat speed, timing, and the hitter's ability to consistently deliver the barrel to the ball.",
        "As the swing progresses, shoulder horizontal adduction also allows the pectoralis major and latissimus dorsi to transition into a more concentric role, helping accelerate the upper body and barrel through contact. The ability to maintain this position is heavily dependent on efficient pelvic rotation, as the pelvis must continue rotating underneath the torso to change the relative position of the rib cage beneath the lead shoulder and preserve separation throughout the swing.",
      ],
    },
    {
      id: "torso-lateral-flexion",
      title: "Torso Lateral Flexion",
      image: "/hitting/torso-lateral-flexion.png",
      paragraphs: [
        "Torso lateral flexion is an important component of an efficient swing because it helps a hitter match the plane of the pitch and maintain the barrel in the hitting zone for a longer period of time. This movement is characterized by side bending of the torso toward the plate side during rotation and is commonly observed in high-level hitters as they move through contact.",
        "One of the primary benefits of torso lateral flexion is its influence on swing plane and barrel depth. Many hitters create the appearance of the barrel staying through the zone longer by combining lateral flexion with rotational movement of the torso. This is often associated with the traditional cue of \"taking the knob to the ball,\" although the underlying movement is driven more by torso positioning than by the hands themselves.",
        "Torso lateral flexion also enhances the relationship between the trunk and pelvis by allowing the core musculature and latissimus dorsi to contribute more effectively to rotational force production. This position helps maintain separation and allows energy generated by the lower half to continue transferring through the torso and into the barrel.",
        "Gavin demonstrates excellent use of torso lateral flexion as he approaches contact. He is able to establish this position prior to ball contact and maintain it through contact, indicating strong frontal plane control of the torso throughout the swing. This allows him to stay on plane effectively, maintain barrel depth through the zone, and create an efficient path to the baseball.",
      ],
    },
    {
      id: "rear-hip-internal-rotation",
      title: "Rear Hip Internal Rotation",
      image: "/hitting/rear-hip-internal-rotation.png",
      paragraphs: [
        "Gavin primarily accesses rear hip internal rotation during the unloading phase of the lower half, achieving peak range of motion after the rear hip has become unweighted and transitioned into a more open-chain position. This represents one strategy for rotating the pelvis, where the hitter relies on open-chain hip internal rotation to complete lower-half rotation and continue the swing.",
        "While Gavin demonstrates sufficient hip internal rotation capacity, he tends to access this motion later in the sequence rather than utilizing it earlier to position the pelvis into landing. As a result, he may miss opportunities to create additional pelvic rotation prior to foot plant, which can influence both separation and rotational efficiency throughout the swing.",
        "High-level hitters often utilize a combination of closed-chain hip external rotation and open-chain hip internal rotation to rotate the pelvis efficiently. In this strategy, the pelvis rotates over a relatively fixed rear femur before the rear hip becomes unweighted, allowing the athlete to establish pelvic rotation earlier and create a more favorable position at foot plant.",
        "Gavin may benefit from drills that improve his ability to access closed-chain rear hip external rotation and rotate the pelvis over a stable rear leg before unloading the back side. Developing this movement pattern could help him achieve a more advantageous pelvic position at landing, improve rotational sequencing, and allow him to better utilize the hip internal rotation capacity he already possesses.",
      ],
    },
    {
      id: "torso-counter-rotation",
      title: "Torso Counter Rotation",
      image: "/hitting/torso-counter-rotation.png",
      paragraphs: [
        "Torso counter rotation is an important component of the loading phase because it helps create the delay necessary to develop separation between the pelvis and torso. This movement contributes to the stretch-shortening cycle and allows the hitter to store rotational energy before initiating the swing. Torso counter rotation also plays a role in weight shift, as both the pelvis and torso move rearward during the load before transitioning into rotation.",
        "There is an optimal amount of counter rotation that allows a hitter to create separation while maintaining visual control of the pitcher. Excessive counter rotation can cause the hitter to lose binocular vision of the baseball, forcing greater reliance on peripheral vision and making pitch recognition more difficult. It may also limit a hitter's ability to achieve an efficient torso position at contact, reducing adjustability and creating directional hitting tendencies. In some cases, hitters with excessive counter rotation become overly pull-oriented or develop an opposite-field bias because of the challenges associated with reorienting the torso into the hitting zone.",
        "Gavin demonstrates an appropriate amount of torso counter rotation during the load. However, he does not effectively rotate the pelvis underneath the torso to establish an optimal position at foot plant. As a result, the separation created during the load is not fully leveraged into the rotational phase of the swing.",
        "This pattern may influence barrel positioning near contact and contribute to a wider rotational arc in the transverse plane. When the pelvis is unable to rotate efficiently underneath a relatively stable torso, the upper body often assumes a greater responsibility for creating rotational velocity, which can reduce efficiency and limit adjustability.",
        "Torso counter rotation serves as one of the primary mechanisms for initiating the stretch-shortening cycle across the oblique musculature and preparing the body for rapid rotation. However, for this stored energy to be utilized effectively, the pelvis must begin rotating at the appropriate time. The ability to rotate the pelvis underneath a stable torso is one of the key sequencing elements observed in high-level hitters and plays a significant role in both bat speed and adjustability.",
        "Gavin may benefit from movement preparation and drill work that emphasizes pelvis-to-torso dissociation and improves his ability to rotate the pelvis independently underneath a stable trunk. Developing this movement strategy could improve rotational efficiency, optimize barrel position, and enhance his ability to make adjustments throughout the swing.",
      ],
    },
    {
      id: "torso-rotation",
      title: "Torso Rotation",
      image: "/hitting/torso-rotation.png",
      paragraphs: [
        "Torso rotation occurs after the pelvis initiates rotation and serves as a critical component of sequencing the swing. One of the most common cues used by elite hitters is to \"stay closed\" for as long as possible. This refers to delaying torso rotation long enough to allow the pelvis to begin rotating first, creating separation and maximizing the transfer of energy through the kinetic chain.",
        "Because the window between swing initiation and ball contact is measured in milliseconds, the timing of torso rotation is just as important as the amount of rotation itself. Efficient hitters are able to keep the torso closed while the pelvis rotates underneath them, then rapidly rotate the trunk into contact to deliver the barrel with both speed and adjustability.",
        "Gavin demonstrates an appropriate degree of torso rotation at ball contact without over-rotating through the swing. This suggests he maintains a relatively tight rotational arc and is able to square the torso to the baseball efficiently. Excessive torso rotation can increase the rotational arc of the swing and negatively affect adjustability, while insufficient torso rotation can limit a hitter's ability to fully deliver the barrel through contact.",
        "Torso rotation at contact is strongly associated with both exit velocity and overall swing efficiency. The ability to reach an effective rotational position at the precise moment of contact allows the hitter to transfer energy efficiently into the baseball while minimizing the time required to move the barrel through the zone. In a game where fractions of a second determine success, this becomes a critical component of bat-to-ball skill.",
        "If a hitter fails to achieve sufficient torso rotation at contact, the barrel may remain directed toward the opposite field, limiting the ability to drive the baseball to all fields and reducing overall offensive versatility. Gavin demonstrates an efficient torso position at contact that allows him to maintain a compact rotational arc while effectively delivering the barrel to the baseball.",
      ],
    },
    {
      id: "lead-hip-internal-rotation",
      title: "Lead Hip Internal Rotation",
      image: "/hitting/lead-hip-internal-rotation.png",
      paragraphs: [
        "Lead hip internal rotation is a critical component of an efficient swing and serves as the foundation for an effective lead-leg block. As the pelvis rotates into contact, the lead hip must internally rotate to accept force, stabilize the front side, and redirect energy back up the kinetic chain. This movement is often described visually as rotating the belt buckle toward the lead hip as the swing progresses through rotation.",
        "Gavin demonstrates an optimal amount of lead hip internal rotation throughout the swing, indicating that he possesses the mobility and movement capacity necessary to create an effective lead-side posting strategy. However, while the total amount of motion is sufficient, the timing of when he accesses this motion appears less efficient.",
        "Because Gavin is unable to achieve an optimal degree of pelvic rotation at landing, he is forced to continue rotating later into the swing to reach his end range of lead hip internal rotation. This increases the total amount of time required to complete lower-half rotation and may reduce the efficiency of energy transfer from the ground through the trunk and into the barrel.",
        "Elite hitters are often able to establish pelvic rotation earlier, allowing lead hip internal rotation to occur at the appropriate point in the sequence. This creates a more stable lead side, improves rotational efficiency, and allows the hitter to deliver the barrel to the ball more quickly. Improving pelvic positioning at landing may allow Gavin to access his lead hip internal rotation earlier in the swing and better utilize the rotational capacity he already possesses.",
      ],
    },
    {
      id: "lead-hip-external-rotation",
      title: "Lead Hip External Rotation",
      image: "/hitting/lead-hip-external-rotation.png",
      paragraphs: [
        "Lead hip external rotation is an important component of creating and maintaining shoulder-to-hip separation throughout the swing. As the lead foot contacts the ground, the lead hip should be positioned in external rotation while the rear hip internally rotates, the pelvis begins rotating toward the pitcher, and the torso remains relatively closed. This creates the separation necessary to store rotational energy before the lead hip transitions into internal rotation and the lead side stabilizes through contact.",
        "Gavin demonstrates a limited degree of lead hip external rotation at landing, which may contribute to his reduced ability to create separation through efficient lower-half mechanics. Because lead hip external rotation helps establish the position from which the pelvis can rotate underneath a stable torso, limitations in this movement may reduce the amount of separation that can be created through pelvic rotation alone.",
        "As a result, hitters will often compensate by increasing torso counter rotation to create the appearance of separation rather than generating it from the ground up. While this strategy may increase measurable separation, it can also increase the amount of time required to get the barrel into the zone and reduce overall rotational efficiency.",
        "Lead hip external rotation serves as a critical transitional position between the loading phase and the rotational phase of the swing. Establishing this position allows the pelvis to begin rotating while maintaining an efficient relationship between the lower and upper body. Improving lead hip external rotation capacity and the ability to control movement within that range may help Gavin create separation more efficiently, reduce the need for compensatory torso counter rotation, and improve overall sequencing throughout the swing.",
        "Gavin may benefit from mobility interventions that improve lead hip external rotation as well as strength and movement exercises that enhance his ability to access and control this position dynamically during the swing.",
      ],
    },
    {
      id: "torso-tilt-during-load-phase",
      title: "Torso Tilt During Load Phase",
      image: "/hitting/torso-tilt-during-load-phase.png",
      paragraphs: [
        "Torso tilt during the load phase is an important indicator of a hitter's spinal organization and overall movement efficiency. Elite hitters typically maintain a relatively neutral spinal position during the load, avoiding excessive flexion or extension. Maintaining a neutral spine provides the greatest number of movement options moving forward and creates a stable foundation for the rotational phase of the swing.",
        "Gavin demonstrates excellent spinal positioning throughout the load phase, maintaining a neutral trunk orientation as he prepares to rotate. This allows the musculature of the trunk and core to operate from optimal lengths prior to the onset of rotation, improving the body's ability to create and transfer force efficiently throughout the swing.",
        "Proper torso positioning during the load phase also contributes to balance, posture, and rotational control. When the spine remains organized, the hitter is better able to maintain efficient sequencing while allowing the pelvis and torso to move independently of one another. Excessive flexion or extension can alter rotational mechanics, limit movement options, and reduce the efficiency of force transfer throughout the swing.",
        "Gavin's ability to maintain a neutral spinal orientation during the loading phase provides a strong foundation for the movements that follow and supports his ability to rotate efficiently while maintaining control of the barrel through contact.",
      ],
    },
    {
      id: "torso-extension-during-rotation-and-blocking-phase",
      title: "Torso Extension During Rotation And Blocking Phase",
      image: "/hitting/torso-extension-during-rotation-and-blocking-phase.png",
      paragraphs: [
        "Torso extension during the rotational and blocking phases of the swing is an important component of efficient movement and force transfer. As the hitter approaches ball contact, controlled extension of the torso helps maintain an optimal swing plane, facilitates hip extension, and enhances lead-side stabilization as the pelvis continues rotating around the front hip.",
        "Elite hitters commonly demonstrate this movement pattern as they transition into contact. Proper torso extension allows the upper body to remain organized while creating space for the barrel to enter and remain in the hitting zone. It also contributes to the lead hip pullback pattern that occurs as the front side stabilizes and the pelvis continues rotating through the swing.",
        "Gavin demonstrates effective torso extension as he approaches ball contact, allowing him to leverage his rotational movements and maintain an efficient position through impact. This helps support barrel control, rotational efficiency, and force transfer throughout the swing.",
        "While Gavin displays this movement well, there may be an opportunity to further increase torso extension within his individual movement strategy. Improving this position could enhance lead-side stabilization, optimize swing plane, and create additional opportunities to transfer energy efficiently into the barrel at contact.",
      ],
    },
    {
      id: "right-shoulder-horizontal-abduction-during-loading-phase",
      title: "Right Shoulder Horizontal Abduction During Loading Phase",
      image: "/hitting/right-shoulder-horizontal-abduction-during-loading-phase.png",
      paragraphs: [
        "Right shoulder horizontal abduction is a critical component of the loading phase and plays an important role in establishing an efficient path for the barrel. As the rear arm moves into horizontal abduction, the scapula is able to externally rotate and remain connected to the rib cage, creating a stable foundation for the upper body to rotate around. This connection between the rear arm, scapula, and trunk is one of the characteristics commonly associated with a compact and efficient swing.",
        "Maintaining scapular position on the rib cage during the load helps preserve the relationship between the upper extremity and torso, allowing the hitter to efficiently transfer force through the swing. When this connection is lost, the barrel will often move away from the body prematurely, creating a longer swing path and increasing the likelihood of casting.",
        "This movement is also influenced by the hitter's ability to create expansion through the right anterior chest wall, allowing the rib cage and scapula to work together to position the rear shoulder for rotation. Establishing this position during the load creates the foundation for the rear shoulder to horizontally adduct and externally rotate during acceleration, helping the hitter maintain an efficient swing plane and deliver the barrel effectively through the zone.",
        "Gavin demonstrates an excellent degree of right shoulder horizontal abduction during the loading phase and achieves this position at the appropriate time within the swing. This allows him to maintain an effective connection between the upper extremity and trunk while creating the necessary conditions to efficiently rotate the rear shoulder during acceleration. As a result, he establishes a strong foundation for barrel control, swing plane, and rotational efficiency through contact.",
      ],
    },
    {
      id: "right-shoulder-rotation-unloading-phase",
      title: "Right Shoulder Rotation Unloading Phase",
      image: "/hitting/right-shoulder-rotation-unloading-phase.png",
      paragraphs: [
        "The unloading phase begins as the rear shoulder transitions downward and into external rotation, helping establish an efficient path for the barrel through the hitting zone. Visually, this movement appears as the rear elbow working down and toward the pitcher, creating the characteristic barrel path often described as a \"Nike swoosh.\" This movement pattern helps position the barrel on plane earlier and is frequently associated with improved bat path metrics and swing efficiency.",
        "External rotation of the rear shoulder is an important contributor to swing plane, barrel depth, and the ability to deliver the barrel efficiently through the zone. To achieve this position, the hitter must be able to maintain appropriate eccentric control of the latissimus dorsi and pectoral musculature while allowing the shoulder to move freely around the rib cage during rotation.",
        "Gavin demonstrates a limited degree of rear shoulder external rotation during the unloading phase. This may be influenced by several factors, including reduced eccentric control of the lat and pectoral musculature, but it may also be related to the positioning of the pelvis earlier in the swing. When the pelvis does not achieve sufficient rotation, the torso and upper extremity often have less space to rotate efficiently, limiting the ability of the rear shoulder to externally rotate and work into an optimal position.",
        "As a result, the rear shoulder can appear to run into the rib cage during acceleration, restricting barrel positioning and reducing the efficiency of the swing path. This can be particularly noticeable on pitches located up and in, where hitters must create sufficient space and barrel depth to keep the barrel on plane and effectively cover that portion of the strike zone.",
        "Improving pelvic rotation and lower-half sequencing may create additional space for the rear shoulder to rotate efficiently during the unloading phase, helping Gavin optimize swing plane, improve barrel positioning, and better cover pitches throughout the strike zone.",
      ],
    },
    {
      id: "lateral-pelvic-tilt",
      title: "Lateral Pelvic Tilt",
      image: "/hitting/lateral-pelvic-tilt.png",
      paragraphs: [
        "Lateral pelvic tilt is an important movement that occurs during the acceleration phase of the swing and contributes to a hitter's ability to efficiently rotate through the lower half. As the rear hip begins internally rotating, the pelvis will naturally begin to laterally tilt, creating positional changes that allow the hitter to continue accessing rotational range of motion throughout the swing.",
        "This movement is particularly important because it helps preserve and enhance available internal rotation at the rear hip. Without sufficient lateral pelvic tilt, a hitter may run out of rotational space earlier in the swing, limiting the ability to continue rotating efficiently through contact. In addition, this position can influence the relationship between the pelvis, rib cage, and upper extremities, helping create the relative positions necessary for efficient shoulder motion during acceleration.",
        "Gavin demonstrates an appropriate amount of lateral pelvic tilt during the acceleration phase and is able to maintain this position as he approaches ball contact. This allows him to continue accessing rear hip internal rotation throughout the rotational phase of the swing and may contribute to a more efficient lower-half turn.",
        "By maintaining lateral pelvic tilt through contact, Gavin is able to create favorable pelvic positioning that supports rotational efficiency and helps maximize the contribution of the rear hip during acceleration. This movement pattern likely plays a role in his ability to continue rotating through the baseball while maintaining an efficient relationship between the pelvis, torso, and barrel.",
      ],
    },
    {
      id: "center-of-gravity-z",
      title: "Center Of Gravity Z",
      image: "/hitting/center-of-gravity-z.png",
      paragraphs: [
        "As rotation begins, elite hitters will often lower their center of gravity as they transition from the loading phase into acceleration. This is one of the strongest indicators of a hitter's ability to rotate efficiently and maintain adjustability throughout the swing. The ability to lower the center of mass allows the athlete to remain athletic while creating the conditions necessary for efficient lower-half rotation.",
        "Lowering the center of gravity increases the amount of energy that can be transferred through the kinetic chain while simultaneously biasing the pelvis toward internal rotation. This helps the hitter create a tighter rotational arc, improve rotational efficiency, and maintain a more compact path to the baseball.",
        "An effective lowering strategy can also improve a hitter's ability to adjust to changes in pitch speed and location. High-level hitters frequently utilize this movement pattern to create delay strategies against off-speed pitches, allowing them to maintain posture and continue rotating efficiently despite having less time to make swing decisions.",
        "Gavin demonstrates this movement pattern effectively and consistently lowers his center of gravity as he begins rotating. During his best swings, he achieves this movement with optimal timing, allowing him to maintain rotational efficiency while preserving adjustability. His ability to lower his center of mass contributes to a more athletic turn, improved rotational control, and a tighter path of the barrel through the hitting zone.",
      ],
    },
  ] satisfies HittingPdfSection[],
  suggestions: {
    title: "Suggestions",
    paragraphs: [
      "Gavin demonstrates an exceptionally efficient swing and produces many of the foundational movement characteristics and rotational velocities commonly observed in elite Major League hitters. His ability to consistently create favorable positions throughout the swing likely contributes to his capacity to cover a large portion of the strike zone against a variety of pitch types and velocities.",
      "Despite these strengths, one area for potential improvement is his ability to rotate the pelvis underneath a relatively stable torso earlier in the sequence, particularly around foot plant. Similar to the patterns observed in his throwing mechanics, improving pelvic rotation at landing may allow Gavin to create and maintain greater shoulder-to-hip separation while optimizing the timing of rotational events throughout the swing.",
      "Enhancing pelvic rotation earlier in the sequence may also improve his ability to access rear shoulder external rotation during the unloading phase and reduce the amount of time required to achieve peak lead hip internal rotation. These adjustments could help Gavin access his highest-quality swing more consistently while improving overall efficiency of movement from the ground up.",
      "When lower-half rotation is delayed, hitters often become more reliant on the upper body to generate rotational velocity. This can increase the time required to deliver the barrel into the hitting zone and may limit coverage of certain pitch locations, particularly on the inner third or upper portion of the strike zone. These patterns can present as pull-side topspin contact or opposite-field flares due to subtle inefficiencies in barrel positioning and timing.",
      "Gavin may benefit from drills and movement strategies that improve his awareness of pelvic rotation underneath a stable torso and reinforce initiating rotation from the ground up. Developing a more efficient lower-half driven rotational strategy may improve sequencing, optimize barrel positioning, and allow him to consistently access the athletic movement qualities that make him such a successful hitter.",
    ],
  },
};
