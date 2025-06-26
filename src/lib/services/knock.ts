interface KnockUserData {
  id: string;
  name: string;
  email: string;
  organization?: string;
  company?: string;
  userType?: 'startup' | 'stakeholder' | 'admin';
}

export async function identifyKnockUser(userData: KnockUserData): Promise<boolean> {
  try {
    if (!process.env.KNOCK_SECRET_API_KEY) {
      console.error('KNOCK_SECRET_API_KEY is not set');
      return false;
    }

    const response = await fetch(`https://api.knock.app/v1/users/${userData.id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${process.env.KNOCK_SECRET_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        ...(userData.organization && { organization: userData.organization }),
        ...(userData.company && { company: userData.company }),
        ...(userData.userType && { user_type: userData.userType }),
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Knock user identification error:', response.status, errorData);
      return false;
    }

    console.log(`Successfully identified user ${userData.id} with Knock`);
    return true;
  } catch (error) {
    console.error('Error identifying user with Knock:', error);
    return false;
  }
}

export async function identifyStakeholderWithKnock(
  stakeholderId: string,
  firstName: string,
  lastName: string,
  email: string,
  organizationName?: string
): Promise<boolean> {
  return identifyKnockUser({
    id: stakeholderId,
    name: `${firstName} ${lastName}`,
    email,
    organization: organizationName,
    userType: 'stakeholder',
  });
}

export async function identifyStartupWithKnock(
  userId: string,
  firstName: string,
  lastName: string,
  email: string,
  companyName?: string
): Promise<boolean> {
  return identifyKnockUser({
    id: userId,
    name: `${firstName} ${lastName}`,
    email,
    company: companyName,
    userType: 'startup',
  });
}
