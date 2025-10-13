const { Resend } = require("resend");
const cron = require("node-cron");
const User = require("../modules/user");
const ConnectionRequest = require("../modules/connectionRequest");
require("dotenv").config();

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

class CronService {
  constructor() {
    this.jobs = [];
    this.resend = resend;
  }

  init() {
    this.startNewYearWishes();
    this.startUserOnboardingSequence();
    this.startReengagementCampaign();
    this.startWeeklyDigest();
    this.startWeeklyAdminReport();
    this.startInactiveUserReminder();

    console.log("🎉 All cron jobs initialized with Resend");
  }

  startUserOnboardingSequence() {
    const day1Job = cron.schedule("* * * * *", async () => {
      try {
        const now = new Date();

        const day1Users = await User.find({
          createdAt: {
            $gte: new Date(now - 4 * 60 * 1000),
            $lt: new Date(now - 3 * 60 * 1000),
          },
          onboardingDay1Sent: { $ne: true },
        });

        for (const user of day1Users) {
          const emailSent = await this.sendDay1OnboardingEmail(
            user.firstName,
            user.emailId
          );
          if (emailSent) {
            await User.findByIdAndUpdate(user._id, {
              onboardingDay1Sent: true,
            });
            //console.log(`✅ Day1 email sent to: ${user.emailId}`);
          }
        }
      } catch (error) {
        console.error("❌ Day1 onboarding job failed:", error);
      }
    });

    const day2Job = cron.schedule("0 9 * * *", async () => {
      try {
        const now = new Date();
        const yesterdayStart = new Date(now);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        yesterdayStart.setHours(0, 0, 0, 0);

        const yesterdayEnd = new Date(yesterdayStart);
        yesterdayEnd.setDate(yesterdayEnd.getDate() + 1);

        const day2Users = await User.find({
          createdAt: {
            $gte: yesterdayStart,
            $lt: yesterdayEnd,
          },
          onboardingDay2Sent: { $ne: true },
        });

        for (const user of day2Users) {
          const emailSent = await this.sendDay2OnboardingEmail(
            user.firstName,
            user.emailId
          );
          if (emailSent) {
            await User.findByIdAndUpdate(user._id, {
              onboardingDay2Sent: true,
            });
            //console.log(`✅ Day2 email sent to: ${user.emailId}`);
          }
        }
      } catch (error) {
        console.error("❌ Day2 onboarding job failed:", error);
      }
    });

    const day3Job = cron.schedule("0 9 * * *", async () => {
      try {
        const now = new Date();
        const twoDaysAgoStart = new Date(now);
        twoDaysAgoStart.setDate(twoDaysAgoStart.getDate() - 2);
        twoDaysAgoStart.setHours(0, 0, 0, 0);

        const twoDaysAgoEnd = new Date(twoDaysAgoStart);
        twoDaysAgoEnd.setDate(twoDaysAgoEnd.getDate() + 1);

        const day3Users = await User.find({
          createdAt: {
            $gte: twoDaysAgoStart,
            $lt: twoDaysAgoEnd,
          },
          onboardingDay3Sent: { $ne: true },
        });

        for (const user of day3Users) {
          const emailSent = await this.sendDay3OnboardingEmail(
            user.firstName,
            user.emailId
          );
          if (emailSent) {
            await User.findByIdAndUpdate(user._id, {
              onboardingDay3Sent: true,
            });
            //console.log(`✅ Day3 email sent to: ${user.emailId}`);
          }
        }
      } catch (error) {
        console.error("❌ Day3 onboarding job failed:", error);
      }
    });

    this.jobs.push(day1Job, day2Job, day3Job);
    //console.log("✅ Onboarding sequence jobs scheduled");
    //console.log("   - Day1: After 3 minutes of signup");
    //console.log("   - Day2: 9 AM next day");
    //console.log("   - Day3: 9 AM after 2 days");
  }

  // Generic email sending method using Resend
  async sendEmail(
    to,
    subject,
    html,
    from = "DevTinder <onboarding@resend.dev>"
  ) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: from,
        to: to,
        subject: subject,
        html: html,
      });

      if (error) {
        console.error(`❌ Resend email error to ${to}:`, error);
        return false;
      }

      console.log(`✅ Email sent successfully to ${to}`);
      return true;
    } catch (error) {
      console.error(`❌ Email sending failed to ${to}:`, error);
      return false;
    }
  }

  startNewYearWishes() {
    const job = cron.schedule("0 0 1 1 *", async () => {
      console.log("🎊 New Year cron job triggered");

      try {
        const allUsers = await User.find({
          emailId: { $exists: true, $ne: null },
          emailPreferences: { $ne: false },
        });

        console.log(`📧 Found ${allUsers.length} users for New Year wishes`);

        let sentCount = 0;
        for (const user of allUsers) {
          const emailSent = await this.sendNewYearWishEmail(
            user.firstName,
            user.emailId
          );

          if (emailSent) {
            sentCount++;
          }

          // Rate limiting - 100ms delay between emails
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        console.log(`✅ Sent ${sentCount} New Year wish emails via Resend`);
      } catch (error) {
        console.error("❌ New Year wishes cron job failed:", error);
      }
    });

    this.jobs.push(job);
  }

  async sendNewYearWishEmail(firstName, email) {
    const subject = `🎊 Happy New Year, ${firstName}! Wishing You an Amazing Year Ahead!`;

    // Use the same HTML content you had before
    const html = `
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 4px; border-radius: 20px;">
          <div style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.1);">
            
            <!-- Header with Fireworks -->
            <div style="background: linear-gradient(135deg, #FFD700, #FF6B6B); padding: 40px 30px; text-align: center; position: relative;">
              <div style="position: absolute; top: 20px; right: 20px; width: 40px; height: 40px; background: rgba(255,255,255,0.3); border-radius: 50%; animation: pulse 2s infinite;"></div>
              <div style="position: absolute; bottom: 20px; left: 20px; width: 30px; height: 30px; background: rgba(255,255,255,0.2); border-radius: 50%;"></div>
              
              <h1 style="margin:0; font-size: 42px; color:#fff; font-weight: 800; text-shadow: 0 4px 10px rgba(0,0,0,0.2);">🎉 HAPPY NEW YEAR! 🎉</h1>
              <p style="margin: 15px 0 0; color: rgba(255,255,255,0.9); font-size: 18px; font-weight: 500;">Welcome to an Amazing ${new Date().getFullYear()}!</p>
            </div>

            <!-- Personal Greeting -->
            <div style="padding: 40px 30px; text-align: center; background: linear-gradient(to bottom, #ffffff, #fafbff);">
              <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #4f46e5, #7c3aed); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 8px 25px rgba(79, 70, 229, 0.3);">
                <span style="font-size: 36px; color: white;">👋</span>
              </div>
              <h2 style="margin:0 0 15px; color:#1f2937; font-size: 28px; font-weight: 700;">Hello ${firstName}!</h2>
              <p style="font-size: 16px; color:#6b7280; line-height: 1.6; margin: 0;">
                As we welcome ${new Date().getFullYear()}, we want to thank you for being part of our amazing community! 
                This year is full of new opportunities and we're excited to have you with us on this journey.
              </p>
            </div>

            <!-- New Year Message -->
            <div style="padding: 30px; background: linear-gradient(135deg, #f0f9ff, #e0f2fe); text-align: center;">
              <div style="display: inline-block; background: white; padding: 20px; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                <span style="font-size: 24px; margin: 0 5px;">✨</span>
                <span style="font-size: 24px; margin: 0 5px;">🌟</span>
                <span style="font-size: 24px; margin: 0 5px;">🎯</span>
              </div>
              <p style="font-size: 16px; color:#374151; margin: 20px 0 0; font-style: italic;">
                "May this new year bring you endless opportunities, success in all your endeavors, and joy in every moment!"
              </p>
            </div>

            <!-- CTA Section -->
            <div style="padding: 40px 30px; text-align: center;">
              <h3 style="margin:0 0 15px; color:#1f2937; font-size: 22px; font-weight: 600;">Ready for an Amazing Year?</h3>
              <p style="font-size: 15px; color:#6b7280; line-height: 1.6; margin: 0 0 25px;">
                Let's make ${new Date().getFullYear()} your most productive and successful year yet!
              </p>
              <a href="http://yourapp.com/dashboard" 
                 style="display: inline-flex; align-items: center; gap: 8px; padding: 16px 35px; background: linear-gradient(135deg, #10b981, #059669); color: white; font-weight: 600; text-decoration: none; border-radius: 50px; box-shadow: 0 6px 20px rgba(16, 185, 129, 0.3); font-size: 16px;">
                 <span>🚀</span> Start Your ${new Date().getFullYear()} Journey
              </a>
            </div>

            <!-- Footer -->
            <div style="background: #1f2937; padding: 30px; text-align: center; color: #9ca3af;">
              <p style="margin: 8px 0; font-size: 14px;">Wishing you a spectacular New Year!</p>
              <p style="margin: 8px 0; font-size: 12px; color: #6b7280;">
                From all of us at Your App Name Team
              </p>
              <div style="margin-top: 20px;">
                <span style="margin: 0 10px; font-size: 20px;">🎊</span>
                <span style="margin: 0 10px; font-size: 20px;">🎁</span>
                <span style="margin: 0 10px; font-size: 20px;">⭐</span>
              </div>
            </div>
          </div>
        </div>
      `;

    return await this.sendEmail(
      email,
      subject,
      html,
      "DevTinder <onboarding@resend.dev>"
    );
  }

  async sendDay1OnboardingEmail(firstName, email) {
    const subject = `🎯 Welcome to Our Community, ${firstName}! Let's Get Started`;

    const html = `
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 4px; border-radius: 20px;">
          <div style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.1);">
            
            <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 40px 30px; text-align: center;">
              <h1 style="margin:0; font-size: 32px; color:#fff; font-weight: 700;">Welcome DevTinder! 🎉</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">So glad to have you with us, ${firstName}!</p>
            </div>

            <div style="padding: 40px 30px; text-align: center;">
              <div style="width: 70px; height: 70px; background: linear-gradient(135deg, #10b981, #059669); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                <span style="font-size: 28px; color: white;">👋</span>
              </div>
              
              <h2 style="margin:0 0 20px; color:#1f2937; font-size: 24px;">Your Journey Starts Now!</h2>
              
              <div style="text-align: left; max-width: 400px; margin: 0 auto;">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                  <div style="width: 40px; height: 40px; background: #f3f4f6; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #4f46e5;">✅</span>
                  </div>
                  <div>
                    <div style="font-weight: 600; color: #1f2937;">Complete Your Profile</div>
                    <div style="font-size: 14px; color: #6b7280;">Add your skills and photo to get discovered</div>
                  </div>
                </div>
                
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                  <div style="width: 40px; height: 40px; background: #f3f4f6; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                    <span style="color: #4f46e5;">🔍</span>
                  </div>
                  <div>
                    <div style="font-weight: 600; color: #1f2937;">Explore Features</div>
                    <div style="font-size: 14px; color: #6b7280;">Discover all the amazing tools we offer</div>
                  </div>
                </div>
              </div>

              <div style="margin-top: 30px;">
                <a href="http://yourapp.com/profile" 
                   style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; font-weight: 600; text-decoration: none; border-radius: 50px; margin: 0 10px;">
                   Complete Profile
                </a>
              </div>
            </div>
          </div>
        </div>
  
    `;

    return await this.sendEmail(email, subject, html);
  }

  async sendDay2OnboardingEmail(firstName, email) {
    const subject = `🌟 Discover Amazing Features, ${firstName}!`;

    const html = `
    <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: auto; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 4px; border-radius: 20px;">
          <div style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.1);">
            
            <div style="background: linear-gradient(135deg, #f093fb, #f5576c); padding: 40px 30px; text-align: center;">
              <h1 style="margin:0; font-size: 32px; color:#fff; font-weight: 700;">Ready to Explore? 🚀</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Let us show you around, ${firstName}!</p>
            </div>

            <div style="padding: 40px 30px; text-align: center;">
              <h2 style="margin:0 0 25px; color:#1f2937; font-size: 24px;">You Might Have Missed These Gems 💎</h2>
              
              <div style="display: grid; gap: 20px; max-width: 400px; margin: 0 auto;">
                <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #f59e0b;">
                  <div style="font-weight: 700; color: #1f2937; margin-bottom: 8px;">🎯 Advanced Search</div>
                  <div style="font-size: 14px; color: #6b7280;">Find exactly what you're looking for with our powerful filters</div>
                </div>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #10b981;">
                  <div style="font-weight: 700; color: #1f2937; margin-bottom: 8px;">💬 Smart Connections</div>
                  <div style="font-size: 14px; color: #6b7280;">Connect with like-minded people in your industry</div>
                </div>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #8b5cf6;">
                  <div style="font-weight: 700; color: #1f2937; margin-bottom: 8px;">📊 Progress Tracking</div>
                  <div style="font-size: 14px; color: #6b7280;">Monitor your growth and achievements</div>
                </div>
              </div>

              <div style="margin-top: 30px;">
                <a href="http://yourapp.com/explore" 
                   style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; font-weight: 600; text-decoration: none; border-radius: 50px;">
                   Explore Features
                </a>
              </div>
            </div>
          </div>
        </div>
    `;

    return await this.sendEmail(email, subject, html);
  }

  async sendDay3OnboardingEmail(firstName, email) {
    const subject = `🎉 One Week In! Here's Your Success Toolkit, ${firstName}`;

    const html = `
       <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: auto; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 4px; border-radius: 20px;">
          <div style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.1);">
            
            <div style="background: linear-gradient(135deg, #4facfe, #00f2fe); padding: 40px 30px; text-align: center;">
              <h1 style="margin:0; font-size: 32px; color:#fff; font-weight: 700;">One Week Celebration! 🎊</h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">You're doing amazing, ${firstName}!</p>
            </div>

            <div style="padding: 40px 30px; text-align: center;">
              <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                <span style="font-size: 32px; color: white;">⭐</span>
              </div>
              
              <h2 style="margin:0 0 15px; color:#1f2937; font-size: 26px;">Pro Tips for Maximum Success</h2>
              <p style="font-size: 16px; color:#6b7280; margin-bottom: 30px;">
                You've been with us for a week! Here are some insider tips to supercharge your experience:
              </p>
              
              <div style="text-align: left; max-width: 400px; margin: 0 auto 30px;">
                <div style="background: #f0f9ff; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                  <div style="font-weight: 700; color: #0369a1; margin-bottom: 5px;">💡 Tip #1: Daily Engagement</div>
                  <div style="font-size: 14px; color: #6b7280;">Spend 10 minutes daily to see the best results</div>
                </div>
                
                <div style="background: #f0f9ff; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                  <div style="font-weight: 700; color: #0369a1; margin-bottom: 5px;">🚀 Tip #2: Complete Profile</div>
                  <div style="font-size: 14px; color: #6b7280;">Users with complete profiles get 3x more connections</div>
                </div>
                
                <div style="background: #f0f9ff; padding: 15px; border-radius: 10px;">
                  <div style="font-weight: 700; color: #0369a1; margin-bottom: 5px;">🎯 Tip #3: Set Goals</div>
                  <div style="font-size: 14px; color: #6b7280;">Define what success looks like for you</div>
                </div>
              </div>

              <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 20px; border-radius: 12px; margin: 30px 0;">
                <p style="margin:0; color: #92400e; font-weight: 600; font-style: italic;">
                  "The secret of getting ahead is getting started." - Mark Twain
                </p>
              </div>

              <a href="http://yourapp.com/dashboard" 
                 style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; font-weight: 600; text-decoration: none; border-radius: 50px;">
                 Continue Your Journey
              </a>
            </div>
          </div>
        </div>
    `;

    return await this.sendEmail(email, subject, html);
  }

  startReengagementCampaign() {
    const touchpoint1 = cron.schedule("0 11 * * *", async () => {
      try {
        const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
        const twentyDaysAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);

        const inactiveUsers = await User.find({
          lastActive: {
            $gte: twentyDaysAgo,
            $lt: fifteenDaysAgo,
          },
          emailPreferences: true,
          reengagementStage: { $exists: false },
        }).limit(100);

        console.log(
          `🔔 Re-engagement Touchpoint 1: Found ${inactiveUsers.length} users`
        );

        for (const user of inactiveUsers) {
          const emailSent = await this.sendReengagementEmail1(user);
          if (emailSent) {
            await User.findByIdAndUpdate(user._id, {
              reengagementStage: 1,
              lastReengagementSent: new Date(),
              $push: {
                engagementCampaigns: {
                  stage: 1,
                  sentAt: new Date(),
                  type: "15_day_inactive",
                },
              },
            });
            console.log(`✅ Touchpoint 1 sent to: ${user.emailId}`);
          }
          await new Promise((resolve) => setTimeout(resolve, 200)); // Rate limiting
        }
      } catch (error) {
        console.error("❌ Re-engagement touchpoint 1 failed:", error);
      }
    });

    const touchpoint2 = cron.schedule("0 12 * * 1", async () => {
      try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const fortyDaysAgo = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000);

        const inactiveUsers = await User.find({
          lastActive: {
            $gte: fortyDaysAgo,
            $lt: thirtyDaysAgo,
          },
          emailPreferences: true,
          reengagementStage: 1,
          lastReengagementSent: {
            $lt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          },
        });

        console.log(
          `🔔 Re-engagement Touchpoint 2: Found ${inactiveUsers.length} users`
        );

        for (const user of inactiveUsers) {
          const newConnections = await ConnectionRequest.countDocuments({
            toUserId: user._id,
            status: "interested",
            createdAt: { $gt: user.lastActive },
          });

          const emailSent = await this.sendReengagementEmail2(
            user,
            newConnections
          );
          if (emailSent) {
            await User.findByIdAndUpdate(user._id, {
              reengagementStage: 2,
              lastReengagementSent: new Date(),
              $push: {
                engagementCampaigns: {
                  stage: 2,
                  sentAt: new Date(),
                  type: "30_day_inactive",
                  newConnections: newConnections,
                },
              },
            });
            console.log(
              `✅ Touchpoint 2 sent to: ${user.emailId} (${newConnections} new connections)`
            );
          }
        }
      } catch (error) {
        console.error("❌ Re-engagement touchpoint 2 failed:", error);
      }
    });

    const touchpoint3 = cron.schedule("0 14 * * 3", async () => {
      try {
        const fortyFiveDaysAgo = new Date(
          Date.now() - 45 * 24 * 60 * 60 * 1000
        );
        const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

        const inactiveUsers = await User.find({
          lastActive: {
            $gte: sixtyDaysAgo,
            $lt: fortyFiveDaysAgo,
          },
          emailPreferences: true,
          reengagementStage: 2,
          lastReengagementSent: {
            $lt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
          },
        });

        console.log(
          `🔔 Re-engagement Touchpoint 3: Found ${inactiveUsers.length} users`
        );

        for (const user of inactiveUsers) {
          const emailSent = await this.sendReengagementEmail3(user);
          if (emailSent) {
            await User.findByIdAndUpdate(user._id, {
              reengagementStage: 3,
              lastReengagementSent: new Date(),
              $push: {
                engagementCampaigns: {
                  stage: 3,
                  sentAt: new Date(),
                  type: "45_day_final",
                },
              },
            });
            console.log(`✅ Touchpoint 3 sent to: ${user.emailId}`);
          }
        }
      } catch (error) {
        console.error("❌ Re-engagement touchpoint 3 failed:", error);
      }
    });

    this.jobs.push(touchpoint1, touchpoint2, touchpoint3);
    //console.log(" Smart Re-engagement Campaign Scheduled (3 touchpoints)");
  }

  async sendReengagementEmail1(user) {
    const subject = `We miss you, ${user.firstName}! 👋 Your community is waiting`;

    const html = `
  <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 4px; border-radius: 20px;">
        <div style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.1);">
          
          <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 40px 30px; text-align: center;">
            <h1 style="margin:0; font-size: 32px; color:#fff; font-weight: 700;">We Miss You! 💫</h1>
            <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Your developer community awaits, ${user.firstName}</p>
          </div>

          <div style="padding: 40px 30px; text-align: center;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
              <span style="font-size: 32px; color: white;">👋</span>
            </div>
            
            <h2 style="margin:0 0 20px; color:#1f2937; font-size: 24px;">Great Connections Are Waiting</h2>
            
            <p style="font-size: 16px; color:#6b7280; line-height: 1.6; margin-bottom: 30px;">
              We noticed you haven't visited lately. Your profile has been getting attention, and there are new developers who'd love to connect with you!
            </p>

            <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; margin: 25px 0;">
              <h3 style="margin:0 0 10px; color:#0369a1; font-size: 18px;">🎯 What You're Missing:</h3>
              <ul style="text-align: left; color:#6b7280; margin: 0; padding-left: 20px;">
                <li>New developers matching your skills</li>
                <li>Potential collaboration opportunities</li>
                <li>Latest community discussions</li>
              </ul>
            </div>

            <div style="margin-top: 30px;">
              <a href="http://yourapp.com/feed" 
                 style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10b981, #059669); color: white; font-weight: 600; text-decoration: none; border-radius: 50px; margin: 0 10px;">
                 Check New Matches
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    return await this.sendEmail(user.emailId, subject, html);
  }

  async sendReengagementEmail2(user, newConnections) {
    const subject = `🔥 ${newConnections} new connection requests waiting for you, ${user.firstName}!`;

    const html = `
      <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: auto; background: linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%); padding: 4px; border-radius: 20px;">
        <div style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.1);">
          
          <div style="background: linear-gradient(135deg, #ff6b6b, #ffa726); padding: 40px 30px; text-align: center;">
            <h1 style="margin:0; font-size: 32px; color:#fff; font-weight: 700;">Don't Miss Out! 🚀</h1>
            <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">${newConnections} developers want to connect with you</p>
          </div>

          <div style="padding: 40px 30px; text-align: center;">
            <div style="width: 100px; height: 100px; background: linear-gradient(135deg, #ec4899, #8b5cf6); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; position: relative;">
              <span style="font-size: 42px; color: white;">💌</span>
              <div style="position: absolute; top: -5px; right: -5px; background: #ef4444; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">
                ${newConnections}
              </div>
            </div>
            
            <h2 style="margin:0 0 15px; color:#1f2937; font-size: 26px;">Your Inbox is Buzzing! 🐝</h2>
            
            <p style="font-size: 16px; color:#6b7280; line-height: 1.6; margin-bottom: 25px;">
              While you were away, <strong>${newConnections} developers</strong> sent you connection requests! 
              They're interested in your skills and want to collaborate.
            </p>

            <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 20px; border-radius: 12px; margin: 25px 0;">
              <h3 style="margin:0 0 10px; color:#92400e; font-size: 18px;">🌟 Quick Stats:</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align: center;">
                <div>
                  <div style="font-size: 24px; font-weight: bold; color:#dc2626;">${newConnections}</div>
                  <div style="font-size: 14px; color:#92400e;">New Requests</div>
                </div>
                <div>
                  <div style="font-size: 24px; font-weight: bold; color:#dc2626;">24h</div>
                  <div style="font-size: 14px; color:#92400e;">Response Time</div>
                </div>
              </div>
            </div>

            <p style="font-size: 14px; color:#6b7280; font-style: italic; margin-bottom: 25px;">
              "Great opportunities don't wait forever. These connections could lead to your next big project!"
            </p>

            <div style="margin-top: 30px;">
              <a href="http://yourapp.com/connections" 
                 style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; font-weight: 600; text-decoration: none; border-radius: 50px; font-size: 16px; box-shadow: 0 6px 20px rgba(236, 72, 153, 0.3);">
                 View Connection Requests
              </a>
            </div>
          </div>
        </div>
      </div>
    `;

    return await this.sendEmail(user.emailId, subject, html);
  }

  async sendReengagementEmail3(user) {
    const subject = `Last Chance, ${user.firstName}! 🎁 Special offer inside...`;

    const html = `
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: auto; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 4px; border-radius: 20px;">
        <div style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.1);">
          
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px 30px; text-align: center; position: relative;">
            <div style="position: absolute; top: 15px; right: 15px; background: #f59e0b; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold;">
              FINAL OFFER
            </div>
            <h1 style="margin:0; font-size: 32px; color:#fff; font-weight: 700;">We Have a Gift For You! 🎁</h1>
            <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">One last try to win you back, ${user.firstName}</p>
          </div>

          <div style="padding: 40px 30px; text-align: center;">
            <div style="width: 120px; height: 120px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px; border: 4px solid #fef3c7;">
              <span style="font-size: 48px; color: white;">🎯</span>
            </div>
            
            <h2 style="margin:0 0 15px; color:#1f2937; font-size: 28px;">We Value You! Here's a Special Offer</h2>
            
            <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); padding: 25px; border-radius: 15px; margin: 25px 0; border: 2px dashed #0ea5e9;">
              <h3 style="margin:0 0 15px; color:#0369a1; font-size: 22px;">🎁 Exclusive Welcome Back Bonus</h3>
              <ul style="text-align: left; color:#1e40af; margin: 0; padding-left: 20px; font-size: 15px;">
                <li><strong>Priority profile boosting</strong> for 7 days</li>
                <li><strong>Advanced search features</strong> unlocked</li>
                <li><strong>Connection suggestions</strong> from top developers</li>
                <li><strong>Profile featured</strong> in community spotlight</li>
              </ul>
            </div>

            <p style="font-size: 14px; color:#6b7280; margin-bottom: 25px;">
              This offer expires in 48 hours. We'd love to understand what we can do better - your feedback is precious to us!
            </p>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 30px;">
              <a href="http://yourapp.com/claim-offer" 
                 style="display: block; padding: 14px 20px; background: linear-gradient(135deg, #10b981, #059669); color: white; font-weight: 600; text-decoration: none; border-radius: 10px; text-align: center;">
                 Claim Offer 🎁
              </a>
              <a href="http://yourapp.com/feedback" 
                 style="display: block; padding: 14px 20px; background: linear-gradient(135deg, #6b7280, #4b5563); color: white; font-weight: 600; text-decoration: none; border-radius: 10px; text-align: center;">
                 Give Feedback 💬
              </a>
            </div>

            <p style="font-size: 12px; color:#9ca3af; margin-top: 20px;">
              If you'd like to stop receiving these emails, you can <a href="http://yourapp.com/unsubscribe" style="color: #6b7280;">unsubscribe here</a>.
            </p>
          </div>
        </div>
      </div>
    `;

    return await this.sendEmail(user.emailId, subject, html);
  }

  startWeeklyDigest() {
    const job = cron.schedule("0 9 * * 1", async () => {
      try {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const activeUsers = await User.find({
          lastActive: { $gte: oneWeekAgo },
          emailPreferences: true,
        }).limit(500);

        console.log(
          `🎊 Sending beautiful weekly digest to ${activeUsers.length} users`
        );

        for (const user of activeUsers) {
          const emailSent = await this.sendWeeklyDigestEmail(user);
          if (emailSent) {
            console.log(`✅ Beautiful weekly digest sent to: ${user.emailId}`);
          }
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error("❌ Weekly digest failed:", error);
      }
    });

    this.jobs.push(job);
  }

  async sendWeeklyDigestEmail(user) {
    const subject = `🌟 Your Weekly DevTinder Digest - Amazing Connections Await, ${user.firstName}!`;

    const html = `
   <html>
       <head>
         <style>
           @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
         </style>
       </head>
       <body style="font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center;">
         <div style="max-width: 650px; margin: 20px; background: #ffffff; border-radius: 28px; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,0.15);">

          <!-- Premium Header -->
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 50px 40px; text-align: center; position: relative;">
            <!-- Decorative Elements -->
            <div style="position: absolute; top: 25px; left: 25px; background: rgba(255,255,255,0.15); padding: 12px; border-radius: 50%;">
              <span style="font-size: 22px; color: white;">✨</span>
            </div>
            <div style="position: absolute; bottom: 25px; right: 25px; background: rgba(255,255,255,0.15); padding: 12px; border-radius: 50%;">
              <span style="font-size: 22px; color: white;">🎯</span>
            </div>

             <!-- Main Icon -->
             <div style="width: 120px; height: 120px; background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1)); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 30px; border: 3px solid rgba(255,255,255,0.3);">
               <span style="font-size: 52px; color: white;">📰</span>
             </div>

            <h1 style="margin: 0; font-size: 42px; color: white; font-weight: 800; letter-spacing: -1px; line-height: 1.1;">Weekly Digest</h1>
            <p style="margin: 15px 0 0; color: rgba(255,255,255,0.9); font-size: 18px; font-weight: 400;">Hello ${
              user.firstName
            }! Your curated developer news</p>
           </div>

           <!-- Main Content -->
           <div style="padding: 50px 40px;">

            <!-- Welcome Section -->
            <div style="text-align: center; margin-bottom: 45px;">
              <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 32px; font-weight: 700; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">This Week's Highlights 🚀</h2>
              <p style="font-size: 17px; color: #6b7280; line-height: 1.6; margin: 0;">
                Amazing opportunities, trending technologies, and new connections are waiting for you.
                Here's what's happening in your developer community this week!
              </p>
            </div>

             <!-- Features Grid -->
            <div style="display: grid; gap: 25px; margin-bottom: 45px;">

              <!-- Feature 1 -->
              <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); padding: 30px; border-radius: 20px; border-left: 5px solid #0ea5e9;">
                <div style="display: flex; align-items: flex-start; gap: 20px;">
                  <div style="width: 60px; height: 60px; background: #0ea5e9; border-radius: 15px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <span style="color: white; font-size: 24px;">👥</span>
                  </div>
                  <div>
                    <h3 style="margin: 0 0 12px; color: #0369a1; font-size: 22px; font-weight: 700;">New Developer Matches</h3>
                    <p style="margin: 0; color: #6b7280; line-height: 1.5; font-size: 15px;">
                      Discover 50+ developers with skills matching yours. Perfect opportunities for collaboration and knowledge sharing!
                    </p>
                  </div>
                </div>
              </div>

              <!-- Feature 2 -->
              <div style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); padding: 30px; border-radius: 20px; border-left: 5px solid #10b981;">
                <div style="display: flex; align-items: flex-start; gap: 20px;">
                  <div style="width: 60px; height: 60px; background: #10b981; border-radius: 15px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <span style="color: white; font-size: 24px;">💼</span>
                  </div>
                  <div>
                    <h3 style="margin: 0 0 12px; color: #059669; font-size: 22px; font-weight: 700;">Project Opportunities</h3>
                    <p style="margin: 0; color: #6b7280; line-height: 1.5; font-size: 15px;">
                      15+ new projects looking for contributors. From startups to open-source, find your next challenge!
                    </p>
                  </div>
                </div>
              </div>

               <!-- Feature 3 -->
               <div style="background: linear-gradient(135deg, #fef7ed, #fed7aa); padding: 30px; border-radius: 20px; border-left: 5px solid #f59e0b;">
                 <div style="display: flex; align-items: flex-start; gap: 20px;">
                   <div style="width: 60px; height: 60px; background: #f59e0b; border-radius: 15px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                     <span style="color: white; font-size: 24px;">🔥</span>
                   </div>
                   <div>
                     <h3 style="margin: 0 0 12px; color: #d97706; font-size: 22px; font-weight: 700;">Trending Technologies</h3>
                     <p style="margin: 0; color: #6b7280; line-height: 1.5; font-size: 15px;">
                       AI/ML, Web3, and Cloud Computing are trending this week. Connect with experts in these domains!
                     </p>
                   </div>
                 </div>
               </div>
             </div>

             <!-- Tip of the Week -->
             <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 30px; border-radius: 20px; margin-bottom: 40px;">
               <div style="display: flex; align-items: center; gap: 20px;">
                 <div style="width: 50px; height: 50px; background: #d97706; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                   <span style="color: white; font-size: 20px;">💡</span>
                 </div>
                 <div>
                   <h3 style="margin: 0 0 10px; color: #92400e; font-size: 20px; font-weight: 700;">Pro Tip of the Week</h3>
                   <p style="margin: 0; color: #92400e; font-size: 15px; line-height: 1.5; font-style: italic;">
                     "Complete your profile with specific project examples to increase connection requests by 3x. Developers love seeing real work!"
                   </p>
                 </div>
               </div>
             </div>

             <!-- CTA Section -->
             <div style="text-align: center;">
               <a href="http://yourapp.com/feed"
                  style="display: inline-flex; align-items: center; gap: 15px; padding: 20px 50px; background: linear-gradient(135deg, #ec4899, #8b5cf6); color: white; font-weight: 700; text-decoration: none; border-radius: 50px; font-size: 18px; box-shadow: 0 10px 30px rgba(236, 72, 153, 0.3); transition: all 0.3s ease; margin-bottom: 20px;">
                  <span style="font-size: 24px;">🚀</span>
                  Explore This Week's Opportunities
               </a>
               <p style="font-size: 15px; color: #6b7280; margin: 0;">
                 Your next great connection is just a click away! ✨
               </p>
             </div>

           </div>

           <!-- Premium Footer -->
           <div style="background: #1f2937; padding: 40px; text-align: center;">
             <div style="display: flex; justify-content: center; gap: 25px; margin-bottom: 25px;">
               <span style="font-size: 28px; opacity: 0.8; transition: opacity 0.3s;">💻</span>
               <span style="font-size: 28px; opacity: 0.8; transition: opacity 0.3s;">🤝</span>
               <span style="font-size: 28px; opacity: 0.8; transition: opacity 0.3s;">🚀</span>
               <span style="font-size: 28px; opacity: 0.8; transition: opacity 0.3s;">⭐</span>
             </div>
             <p style="margin: 0 0 15px; color: #d1d5db; font-size: 15px; font-weight: 500;">
               Building the world's best developer community, one connection at a time
             </p>
             <p style="margin: 0; color: #9ca3af; font-size: 13px;">
               Delivered with ❤️ by DevTinder Team • ${new Date().toLocaleDateString(
                 "en-US",
                 {
                   weekday: "long",
                   year: "numeric",
                   month: "long",
                   day: "numeric",
                 }
               )}
             </p>
           </div>

         </div>
       </body>
       </html>
    `;

    return await this.sendEmail(user.emailId, subject, html);
  }

  async sendUserWeeklyDigest(user) {
    const subject = `🌟 Your Weekly DevTinder Digest - Amazing Connections Await, ${user.firstName}!`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
      </style>
    </head>
    <body style="font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center;">
      <div style="max-width: 650px; margin: 20px; background: #ffffff; border-radius: 28px; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,0.15);">
        
        <!-- Premium Header -->
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 50px 40px; text-align: center; position: relative;">
          <!-- Decorative Elements -->
          <div style="position: absolute; top: 25px; left: 25px; background: rgba(255,255,255,0.15); padding: 12px; border-radius: 50%;">
            <span style="font-size: 22px; color: white;">✨</span>
          </div>
          <div style="position: absolute; bottom: 25px; right: 25px; background: rgba(255,255,255,0.15); padding: 12px; border-radius: 50%;">
            <span style="font-size: 22px; color: white;">🎯</span>
          </div>
          
          <!-- Main Icon -->
          <div style="width: 120px; height: 120px; background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1)); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 30px; border: 3px solid rgba(255,255,255,0.3);">
            <span style="font-size: 52px; color: white;">📰</span>
          </div>
          
          <h1 style="margin: 0; font-size: 42px; color: white; font-weight: 800; letter-spacing: -1px; line-height: 1.1;">Weekly Digest</h1>
          <p style="margin: 15px 0 0; color: rgba(255,255,255,0.9); font-size: 18px; font-weight: 400;">Hello ${user.firstName}! Your curated developer news</p>
        </div>

        <!-- Rest of your user weekly digest HTML content -->
        <!-- ... (include the rest of your weekly digest HTML here) ... -->
        
      </div>
    </body>
    </html>
  `;

    return await this.sendEmail(user.emailId, subject, html);
  }

  async sendWeeklyAdminReport(
    totalUsers,
    activeUsers,
    newUsers,
    activationRate
  ) {
    const subject = `📊 Weekly Admin Report - ${new Date().toDateString()}`;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
      </style>
    </head>
    <body style="font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center;">
      <div style="max-width: 650px; margin: 20px; background: #ffffff; border-radius: 28px; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,0.15);">
        
        <!-- Premium Header -->
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 50px 40px; text-align: center; position: relative;">
          <!-- Decorative Elements -->
          <div style="position: absolute; top: 25px; left: 25px; background: rgba(255,255,255,0.15); padding: 12px; border-radius: 50%;">
            <span style="font-size: 22px; color: white;">📊</span>
          </div>
          <div style="position: absolute; bottom: 25px; right: 25px; background: rgba(255,255,255,0.15); padding: 12px; border-radius: 50%;">
            <span style="font-size: 22px; color: white;">👑</span>
          </div>
          
          <!-- Main Icon -->
          <div style="width: 120px; height: 120px; background: linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.1)); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 30px; border: 3px solid rgba(255,255,255,0.3);">
            <span style="font-size: 52px; color: white;">📈</span>
          </div>
          
          <h1 style="margin: 0; font-size: 42px; color: white; font-weight: 800; letter-spacing: -1px; line-height: 1.1;">Admin Report</h1>
          <p style="margin: 15px 0 0; color: rgba(255,255,255,0.9); font-size: 18px; font-weight: 400;">Weekly platform insights and metrics</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 50px 40px;">
          
          <!-- Stats Section -->
          <div style="text-align: center; margin-bottom: 45px;">
            <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 32px; font-weight: 700; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Platform Overview 🚀</h2>
            <p style="font-size: 17px; color: #6b7280; line-height: 1.6; margin: 0;">
              Here's how our platform performed this week. Key metrics and insights for better decision making.
            </p>
          </div>

          <!-- Stats Grid -->
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 45px;">
            
            <!-- Total Users -->
            <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); padding: 25px; border-radius: 15px; text-align: center; border-left: 4px solid #0ea5e9;">
              <div style="font-size: 36px; font-weight: 800; color: #0369a1; margin-bottom: 8px;">${totalUsers}</div>
              <div style="font-size: 14px; color: #6b7280; font-weight: 600;">Total Users</div>
            </div>

            <!-- Active Users -->
            <div style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); padding: 25px; border-radius: 15px; text-align: center; border-left: 4px solid #10b981;">
              <div style="font-size: 36px; font-weight: 800; color: #059669; margin-bottom: 8px;">${activeUsers}</div>
              <div style="font-size: 14px; color: #6b7280; font-weight: 600;">Active Users</div>
            </div>

            <!-- New Users -->
            <div style="background: linear-gradient(135deg, #fef7ed, #fed7aa); padding: 25px; border-radius: 15px; text-align: center; border-left: 4px solid #f59e0b;">
              <div style="font-size: 36px; font-weight: 800; color: #d97706; margin-bottom: 8px;">${newUsers}</div>
              <div style="font-size: 14px; color: #6b7280; font-weight: 600;">New Users</div>
            </div>

            <!-- Activation Rate -->
            <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 25px; border-radius: 15px; text-align: center; border-left: 4px solid #eab308;">
              <div style="font-size: 36px; font-weight: 800; color: #92400e; margin-bottom: 8px;">${activationRate}%</div>
              <div style="font-size: 14px; color: #6b7280; font-weight: 600;">Activation Rate</div>
            </div>
          </div>

          <!-- Insights Section -->
          <div style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); padding: 30px; border-radius: 20px; margin-bottom: 40px;">
            <h3 style="margin: 0 0 20px; color: #1f2937; font-size: 22px; font-weight: 700; text-align: center;">📈 Weekly Insights</h3>
            
            <div style="display: grid; gap: 15px;">
              <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: white; border-radius: 12px;">
                <div style="width: 40px; height: 40px; background: #10b981; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-size: 18px;">👥</span>
                </div>
                <div>
                  <div style="font-weight: 600; color: #1f2937;">User Growth</div>
                  <div style="font-size: 14px; color: #6b7280;">${newUsers} new users joined this week</div>
                </div>
              </div>
              
              <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: white; border-radius: 12px;">
                <div style="width: 40px; height: 40px; background: #0ea5e9; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-size: 18px;">📊</span>
                </div>
                <div>
                  <div style="font-weight: 600; color: #1f2937;">Engagement Rate</div>
                  <div style="font-size: 14px; color: #6b7280;">${activationRate}% of users are active weekly</div>
                </div>
              </div>
              
              <div style="display: flex; align-items: center; gap: 15px; padding: 15px; background: white; border-radius: 12px;">
                <div style="width: 40px; height: 40px; background: #8b5cf6; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-size: 18px;">🎯</span>
                </div>
                <div>
                  <div style="font-weight: 600; color: #1f2937;">Platform Health</div>
                  <div style="font-size: 14px; color: #6b7280;">${activeUsers} active users engaging with the platform</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recommendations -->
          <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 25px; border-radius: 16px; margin-bottom: 30px;">
            <h3 style="margin: 0 0 15px; color: #92400e; font-size: 20px; font-weight: 700; text-align: center;">💡 Recommendations</h3>
            <ul style="color: #92400e; margin: 0; padding-left: 20px; font-size: 14px;">
              <li>Focus on user retention strategies</li>
              <li>Engage with inactive users through re-engagement campaigns</li>
              <li>Analyze user behavior patterns for feature improvements</li>
            </ul>
          </div>

        </div>

        <!-- Footer -->
        <div style="background: #1f2937; padding: 40px; text-align: center;">
          <div style="display: flex; justify-content: center; gap: 25px; margin-bottom: 25px;">
            <span style="font-size: 28px; opacity: 0.8;">📊</span>
            <span style="font-size: 28px; opacity: 0.8;">👑</span>
            <span style="font-size: 28px; opacity: 0.8;">🚀</span>
            <span style="font-size: 28px; opacity: 0.8;">⭐</span>
          </div>
          <p style="margin: 0 0 15px; color: #d1d5db; font-size: 15px; font-weight: 500;">
            DevTinder Admin Dashboard - Making data-driven decisions
          </p>
          <p style="margin: 0; color: #9ca3af; font-size: 13px;">
            Report generated on ${new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

      </div>
    </body>
    </html>
  `;

    // Send to admin email
    const adminEmail = process.env.ADMIN_EMAIL || "rajeshelluru143@gmail.com";
    return await this.sendEmail(adminEmail, subject, html);
  }

  startWeeklyAdminReport() {
    const job = cron.schedule("0 8 * * 1", async () => {
      try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({
          lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        });
        const newUsers = await User.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        });
        const activationRate = ((activeUsers / totalUsers) * 100).toFixed(1);

        await this.sendWeeklyAdminReport(
          totalUsers,
          activeUsers,
          newUsers,
          activationRate
        );
        console.log("🎉 Beautiful weekly admin report sent via Resend!");
      } catch (error) {
        console.error("❌ Weekly admin report failed:", error);
      }
    });

    this.jobs.push(job);
  }

  async sendInactiveUserReminder(user) {
    const subject = `🌟 We Miss Your Amazing Energy, ${user.firstName}! 👋`;

    const html = `
     <html>
            <head>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
              </style>
            </head>
            <body style="font-family: 'Inter', Arial, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center;">
              <div style="max-width: 600px; margin: 20px; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.15);">
                
                <!-- Header Section -->
                <div style="background: linear-gradient(135deg, #FF6B6B, #FFA726); padding: 50px 40px; text-align: center; position: relative;">
                  <div style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.2); padding: 10px; border-radius: 50%;">
                    <span style="font-size: 20px;">💫</span>
                  </div>
                  <div style="width: 100px; height: 100px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 25px;">
                    <span style="font-size: 48px; color: white;">👋</span>
                  </div>
                  <h1 style="margin: 0; font-size: 38px; color: white; font-weight: 700; letter-spacing: -0.5px;">We Miss You!</h1>
                  <p style="margin: 15px 0 0; color: rgba(255,255,255,0.9); font-size: 18px; font-weight: 400;">Your developer community awaits, ${user.firstName}!</p>
                </div>

                <!-- Main Content -->
                <div style="padding: 50px 40px;">
                  
                  <!-- Welcome Back Message -->
                  <div style="text-align: center; margin-bottom: 40px;">
                    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 28px; font-weight: 600;">Great Connections Are Waiting! 🚀</h2>
                    <p style="font-size: 16px; color: #6b7280; line-height: 1.6; margin: 0;">
                      We noticed you've been away for a while. Your profile has been getting attention, 
                      and there are amazing developers who'd love to connect and collaborate with you!
                    </p>
                  </div>

                  <!-- What You're Missing -->
                  <div style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe); padding: 30px; border-radius: 20px; margin-bottom: 35px; border: 2px dashed #0ea5e9;">
                    <h3 style="margin: 0 0 20px; color: #0369a1; font-size: 22px; font-weight: 600; text-align: center;">🎯 Here's What You're Missing</h3>
                    <div style="display: grid; gap: 15px;">
                      <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="width: 40px; height: 40px; background: #0ea5e9; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                          <span style="color: white; font-size: 18px;">👥</span>
                        </div>
                        <div>
                          <div style="font-weight: 600; color: #1f2937;">New Developer Matches</div>
                          <div style="font-size: 14px; color: #6b7280;">Developers with similar skills want to connect</div>
                        </div>
                      </div>
                      <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="width: 40px; height: 40px; background: #10b981; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                          <span style="color: white; font-size: 18px;">💼</span>
                        </div>
                        <div>
                          <div style="font-weight: 600; color: #1f2937;">Collaboration Opportunities</div>
                          <div style="font-size: 14px; color: #6b7280;">Exciting projects waiting for your expertise</div>
                        </div>
                      </div>
                      <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="width: 40px; height: 40px; background: #f59e0b; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                          <span style="color: white; font-size: 18px;">🌟</span>
                        </div>
                        <div>
                          <div style="font-weight: 600; color: #1f2937;">Community Updates</div>
                          <div style="font-size: 14px; color: #6b7280;">Latest trends and discussions in tech</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Stats Highlight -->
                  <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 25px; border-radius: 16px; margin-bottom: 35px; text-align: center;">
                    <h3 style="margin: 0 0 15px; color: #92400e; font-size: 20px; font-weight: 600;">📈 Quick Community Stats</h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                      <div>
                        <div style="font-size: 24px; font-weight: 800; color: #dc2626;">50+</div>
                        <div style="font-size: 12px; color: #92400e;">New Members</div>
                      </div>
                      <div>
                        <div style="font-size: 24px; font-weight: 800; color: #dc2626;">100+</div>
                        <div style="font-size: 12px; color: #92400e;">Connections Made</div>
                      </div>
                      <div>
                        <div style="font-size: 24px; font-weight: 800; color: #dc2626;">25+</div>
                        <div style="font-size: 12px; color: #92400e;">Projects Started</div>
                      </div>
                    </div>
                  </div>

                  <!-- CTA Button -->
                  <div style="text-align: center;">
                    <a href="http://yourapp.com/feed" 
                       style="display: inline-flex; align-items: center; gap: 12px; padding: 18px 45px; background: linear-gradient(135deg, #10b981, #059669); color: white; font-weight: 700; text-decoration: none; border-radius: 50px; font-size: 16px; box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3); transition: all 0.3s ease;">
                       <span style="font-size: 20px;">🚀</span>
                       Explore New Matches
                    </a>
                    <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
                      It only takes 2 minutes to rediscover amazing opportunities!
                    </p>
                  </div>

                </div>

                <!-- Footer -->
                <div style="background: #1f2937; padding: 35px 40px; text-align: center;">
                  <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 20px;">
                    <span style="font-size: 24px; opacity: 0.8;">💻</span>
                    <span style="font-size: 24px; opacity: 0.8;">🤝</span>
                    <span style="font-size: 24px; opacity: 0.8;">🚀</span>
                  </div>
                  <p style="margin: 0; color: #9ca3af; font-size: 14px; line-height: 1.5;">
                    Your skills are valuable to our community. We can't wait to see what you'll build next!<br>
                    <strong style="color: #d1d5db;">The DevTinder Team</strong>
                  </p>
                  <p style="margin: 15px 0 0; color: #6b7280; font-size: 12px;">
                    If you'd like to adjust your email preferences, you can 
                    <a href="http://yourapp.com/preferences" style="color: #9ca3af; text-decoration: underline;">update them here</a>.
                  </p>
                </div>

              </div>
            </body>
            </html>
    `;

    return await this.sendEmail(user.emailId, subject, html);
  }

  startInactiveUserReminder() {
    const job = cron.schedule("0 11 * * 0", async () => {
      try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const inactiveUsers = await User.find({
          lastActive: { $lt: thirtyDaysAgo },
          emailPreferences: true,
        }).limit(50);

        console.log(
          `🎯 Found ${inactiveUsers.length} users inactive for 30+ days`
        );

        for (const user of inactiveUsers) {
          const emailSent = await this.sendInactiveUserReminder(user);
          if (emailSent) {
            console.log(
              `✅ Beautiful inactive reminder sent to: ${user.emailId}`
            );
          }
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error("❌ Inactive user reminder failed:", error);
      }
    });

    this.jobs.push(job);
  }

  stopAll() {
    this.jobs.forEach((job) => job.stop());
    console.log("🛑 All cron jobs stopped");
  }
}

module.exports = new CronService();
