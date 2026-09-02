class Solution:
    def isSumProperty(self, root):
        def dfs(node):
            if not node:return True
            if not node.left and not node.right:
                return True
            left = node.left.data if node.left else 0
            right = node.right.data if node.right else 0
            if node.data != left + right:
                return False
            
            if not dfs(node.left) or not dfs(node.right):
                return False
            
            return True
        return dfs(root)