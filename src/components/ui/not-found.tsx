import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function NotFound() {
    return (
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10 lg:px-8">
            <Card className="border-border/60">
                <CardHeader>
                    <CardTitle>Not found</CardTitle>
                    <CardDescription>The page you’re looking for doesn’t exist.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-4">
                    <div className="text-muted-foreground text-sm">
                        Check the URL or go back to the dashboard.
                    </div>
                    <Link to="/">
                        <Button>
                            Go home
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
