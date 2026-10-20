function getPassword(passwordSource, user) {
  if (typeof passwordSource === "string") return passwordSource;
  if (passwordSource && typeof passwordSource.password === "string") {
    return passwordSource.password;
  }
  if (passwordSource && typeof passwordSource.getPassword === "function") {
    return passwordSource.getPassword(user);
  }
  return user?.key === "admin-local" ? "admin123456" : "guru123456";
}

export async function ensureAdminUser(adminClient, adminFixture, passwordSource) {
  const listResult = await adminClient.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listResult?.error) {
    throw new Error(`Gagal membaca akun admin lokal: ${listResult.error.message}`);
  }
  const staleAdmins = listResult.data?.users?.filter(
    (user) =>
      user.email?.toLowerCase() !== adminFixture.email.toLowerCase() &&
      (user.email?.toLowerCase() === "local-admin@uzmacourse.test" ||
        user.user_metadata?.role === "admin")
  );
  if (staleAdmins?.length && typeof adminClient.auth?.admin?.deleteUser === "function") {
    for (const stale of staleAdmins) {
      await adminClient.auth.admin.deleteUser(stale.id);
    }
  }


  const existingUser = listResult.data?.users?.find(
    (user) => user.email?.toLowerCase() === adminFixture.email.toLowerCase()
  );
  const password = getPassword(passwordSource, adminFixture);
  const userMetadata = {
    full_name: adminFixture.fullName,
    role: "admin",
  };

  if (existingUser) {
    const result = await adminClient.auth.admin.updateUserById(existingUser.id, {
      password,
      email_confirm: true,
      user_metadata: userMetadata,
    });
    if (result?.error) {
      throw new Error(`Gagal memperbarui akun admin lokal: ${result.error.message}`);
    }
    return {
      id: existingUser.id,
      email: adminFixture.email,
      fullName: adminFixture.fullName,
      password,
      created: false,
    };
  }

  const result = await adminClient.auth.admin.createUser({
    email: adminFixture.email,
    password,
    email_confirm: true,
    user_metadata: userMetadata,
  });
  if (result?.error || !result?.data?.user?.id) {
    throw new Error(
      `Gagal membuat akun admin lokal: ${result?.error?.message || "user tidak dikembalikan."}`
    );
  }
  return {
    id: result.data.user.id,
    email: adminFixture.email,
    fullName: adminFixture.fullName,
    password,
    created: true,
  };
}

export async function deleteCreatedUsers(adminClient, userIds) {
  for (const userId of userIds) {
    const result = await adminClient.auth.admin.deleteUser(userId);
    if (result?.error) {
      throw new Error(`Gagal membersihkan akun guru dummy: ${result.error.message}`);
    }
  }
}

export async function createGuruUsers(adminClient, guruFixtures, passwordSource) {
  const createdUsers = [];

  try {
    for (const guru of guruFixtures) {
      const password = getPassword(passwordSource, guru);
      const result = await adminClient.auth.admin.createUser({
        email: guru.email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: guru.fullName,
          role: "guru",
        },
      });

      if (result?.error || !result?.data?.user?.id) {
        throw new Error(
          `Gagal membuat akun guru ${guru.email}: ${result?.error?.message || "user tidak dikembalikan."}`
        );
      }

      createdUsers.push({
        id: result.data.user.id,
        email: guru.email,
        fullName: guru.fullName,
        password,
      });
    }

    return createdUsers;
  } catch (error) {
    if (createdUsers.length > 0) {
      try {
        await deleteCreatedUsers(
          adminClient,
          createdUsers.map((user) => user.id)
        );
      } catch (cleanupError) {
        const cleanupMessage = cleanupError instanceof Error ? cleanupError.message : String(cleanupError);
        const originalMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`${originalMessage} Cleanup juga gagal: ${cleanupMessage}`);
      }
    }
    throw error;
  }
}
