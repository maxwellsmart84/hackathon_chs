import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { users, startups } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { StartupOnboardingSchema, type StartupOnboardingFormData } from "@/lib/validations/startup-onboarding";

// Mapping functions to convert new form data to existing schema
function mapStageToExistingStage(stage: string): string {
  const stageMap: Record<string, string> = {
    "Idea": "idea",
    "Prototype": "prototype", 
    "Pre-Clinical": "mvp",
    "FDA Submission": "early-revenue",
    "Post-Market": "scaling"
  };
  return stageMap[stage] || "idea";
}

function mapFocusAreasToExistingFocusArea(focusAreas: string[]): string {
  // Map the first focus area to existing schema
  const focusAreaMap: Record<string, string> = {
    "Cardiology": "cardiology",
    "Oncology": "oncology", 
    "Neurology": "neurology",
    "Pediatrics": "pediatrics",
    "Orthopedics": "orthopedics",
    "Other": "other"
  };
  return focusAreaMap[focusAreas[0]] || "other";
}

function generateCurrentGoalsFromFormData(data: StartupOnboardingFormData): string[] {
  const goals: string[] = [];
  
  // Generate goals based on form selections
  if (data.productTypes.includes("Diagnostic")) {
    goals.push("Develop diagnostic solutions");
  }
  if (data.productTypes.includes("Therapeutic")) {
    goals.push("Create therapeutic interventions");
  }
  if (data.productTypes.includes("Device")) {
    goals.push("Build medical devices");
  }
  if (data.productTypes.includes("Software")) {
    goals.push("Develop healthcare software");
  }
  if (data.productTypes.includes("Digital Therapeutic")) {
    goals.push("Create digital therapeutic solutions");
  }
  
  if (data.needsClinicalTrials) {
    goals.push("Conduct clinical trials");
  }
  
  if (data.regulatoryStatus && data.regulatoryStatus !== "None") {
    goals.push("Navigate regulatory approval process");
  }
  
  return goals.length > 0 ? goals : ["Advance product development"];
}

function generateCurrentNeedsFromFormData(data: StartupOnboardingFormData): string[] {
  const needs: string[] = [];
  
  // Generate needs based on business support selections
  if (data.businessNeeds) {
    data.businessNeeds.forEach(need => {
      switch (need) {
        case "Reimbursement Strategy":
          needs.push("Reimbursement strategy guidance");
          break;
        case "IP & Licensing":
          needs.push("Intellectual property support");
          break;
        case "Academic Collaboration":
          needs.push("Academic partnerships");
          break;
        case "Tech Transfer":
          needs.push("Technology transfer assistance");
          break;
        case "Commercialization Support":
          needs.push("Commercialization guidance");
          break;
      }
    });
  }
  
  // Add technology-specific needs
  if (data.technologies.includes("AI/ML")) {
    needs.push("AI/ML expertise");
  }
  
  // Add regulatory needs
  if (data.needsClinicalTrials) {
    needs.push("Clinical trial design and execution");
  }
  
  if (data.nihFundingInterest === "Yes" || data.nihFundingInterest === "Interested") {
    needs.push("NIH funding guidance");
  }
  
  return needs.length > 0 ? needs : ["General business support"];
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user first to verify they exist and are a startup
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.userType !== "startup") {
      return NextResponse.json({ error: "Access denied - not a startup user" }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate the onboarding form data
    const validatedData = StartupOnboardingSchema.parse(body);

    // Check if startup profile already exists
    const existingStartup = await db.query.startups.findFirst({
      where: eq(startups.userId, user.id),
    });

    if (existingStartup) {
      return NextResponse.json({ error: "Startup profile already exists" }, { status: 409 });
    }

    // Map the new form data to existing startup profile schema
    const mappedData = {
      companyName: validatedData.name,
      description: validatedData.description,
      website: "", // Not collected in new form
      focusArea: mapFocusAreasToExistingFocusArea(validatedData.focusAreas),
      stage: mapStageToExistingStage(validatedData.stage),
      currentGoals: generateCurrentGoalsFromFormData(validatedData),
      currentNeeds: generateCurrentNeedsFromFormData(validatedData),
      milestones: [], // Not collected in new form
      fundingStatus: undefined, // Not collected in new form
      teamSize: undefined, // Not collected in new form
      location: undefined, // Not collected in new form
    };

    // Create startup profile
    const newStartup = await db.insert(startups).values({
      id: crypto.randomUUID(),
      userId: user.id,
      ...mappedData,
    });

    // Update user profile completion status
    await db.update(users)
      .set({ 
        profileComplete: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return NextResponse.json(
      { 
        message: "Startup onboarding completed successfully", 
        startupId: newStartup.insertId,
        redirectTo: "/dashboard"
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error processing startup onboarding:", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 