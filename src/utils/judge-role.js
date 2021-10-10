export default function judgeRole(snapshot) {
    if (!snapshot) return 0;
    if (!snapshot.exists()) return 0;

    if (snapshot.data().isSuperAdmin) return 2;
    if (snapshot.data().isAdmin) return 1;

    return 0;
}