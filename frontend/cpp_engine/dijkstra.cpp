#include <iostream>
#include <vector>
#include <queue>
#include <limits>
#include <sstream>

using namespace std;

const double INF = numeric_limits<double>::infinity();

struct Edge {
    int to;
    double weight;
};

int main() {
    int num_nodes, num_edges;
    if (!(cin >> num_nodes >> num_edges)) return 0;

    // Read edges
    vector<vector<Edge>> graph(num_nodes + 1);
    for (int i = 0; i < num_edges; ++i) {
        int u, v;
        double w;
        cin >> u >> v >> w;
        graph[u].push_back({v, w});
        graph[v].push_back({u, w}); // Assuming undirected roads
    }

    int start_node, end_node;
    cin >> start_node >> end_node;

    // Dijkstra's Algorithm
    vector<double> dist(num_nodes + 1, INF);
    vector<int> parent(num_nodes + 1, -1);
    priority_queue<pair<double, int>, vector<pair<double, int>>, greater<pair<double, int>>> pq;

    dist[start_node] = 0;
    pq.push({0, start_node});

    while (!pq.empty()) {
        double d = pq.top().first;
        int u = pq.top().second;
        pq.pop();

        if (d > dist[u]) continue;

        for (auto& edge : graph[u]) {
            if (dist[u] + edge.weight < dist[edge.to]) {
                dist[edge.to] = dist[u] + edge.weight;
                parent[edge.to] = u;
                pq.push({dist[edge.to], edge.to});
            }
        }
    }

    // Output result
    if (dist[end_node] == INF) {
        cout << "NO_PATH" << endl;
    } else {
        cout << dist[end_node] << endl;
        // Reconstruct path
        vector<int> path;
        for (int at = end_node; at != -1; at = parent[at]) {
            path.push_back(at);
        }
        for (int i = path.size() - 1; i >= 0; --i) {
            cout << path[i] << (i == 0 ? "" : " ");
        }
        cout << endl;
    }

    return 0;
}