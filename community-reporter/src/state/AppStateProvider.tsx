const [points, setPoints] = useState(0);
const [badges, setBadges] = useState<string[]>([]);
const [comments, setComments] = useState<Comment[]>([]);
const [myCommentCount, setMyCommentCount] = useState(0);



function addComment(reportId: string, text: string) {

    const newComment: Comment = {
        id: crypto.randomUUID(),
        reportId,
        userId: user.id,
        text,
        createdAt: new Date().toISOString(),
    };

    setComments((prev) => [newComment, ...prev]);

    // points + helper badge logic
    setPoints((p) => p + 1);

    setMyCommentCount((c) => {
        const next = c + 1;

        // unlock Helper badge at 5 comments/updates
        if (next >= 5) {
            setBadges((b) => (b.includes("Helper") ? b : [...b, "Helper"]));
        }

        return next;
    });
}
