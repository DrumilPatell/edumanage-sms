import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Rectangle, Ellipse, Polygon
import numpy as np

# Create diagrams directory output
import os
os.makedirs('d:/Drumil/edumanage-sms/diagrams/output', exist_ok=True)

# ============================================
# 1. BLOCK DIAGRAM
# ============================================
def create_block_diagram():
    fig, ax = plt.subplots(1, 1, figsize=(14, 10))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 10)
    ax.axis('off')
    ax.set_title('Block Diagram - EduManage Student Management System', fontsize=16, fontweight='bold', pad=20)
    
    # Admin Side Box
    admin_box = FancyBboxPatch((0.5, 2), 4, 7, boxstyle="round,pad=0.05", 
                                facecolor='#E3F2FD', edgecolor='#1976D2', linewidth=2)
    ax.add_patch(admin_box)
    ax.text(2.5, 8.5, 'Admin Side', fontsize=12, fontweight='bold', ha='center')
    
    # Admin modules
    admin_modules = ['User Management', 'Student Management', 'Course Management', 'Fee Management', 'Reports']
    for i, module in enumerate(admin_modules):
        rect = FancyBboxPatch((0.8, 7.2 - i*1.1), 3.4, 0.8, boxstyle="round,pad=0.02",
                              facecolor='white', edgecolor='#1976D2', linewidth=1.5)
        ax.add_patch(rect)
        ax.text(2.5, 7.6 - i*1.1, module, fontsize=9, ha='center', va='center')
    
    # Faculty Side Box
    faculty_box = FancyBboxPatch((5, 4.5), 4, 4.5, boxstyle="round,pad=0.05",
                                  facecolor='#E8F5E9', edgecolor='#388E3C', linewidth=2)
    ax.add_patch(faculty_box)
    ax.text(7, 8.5, 'Faculty Side', fontsize=12, fontweight='bold', ha='center')
    
    # Faculty modules
    faculty_modules = ['Course Management', 'Attendance Tracking', 'Grade Management']
    for i, module in enumerate(faculty_modules):
        rect = FancyBboxPatch((5.3, 7.2 - i*1.1), 3.4, 0.8, boxstyle="round,pad=0.02",
                              facecolor='white', edgecolor='#388E3C', linewidth=1.5)
        ax.add_patch(rect)
        ax.text(7, 7.6 - i*1.1, module, fontsize=9, ha='center', va='center')
    
    # Student Side Box
    student_box = FancyBboxPatch((9.5, 4.5), 4, 4.5, boxstyle="round,pad=0.05",
                                  facecolor='#FFF3E0', edgecolor='#F57C00', linewidth=2)
    ax.add_patch(student_box)
    ax.text(11.5, 8.5, 'Student Side', fontsize=12, fontweight='bold', ha='center')
    
    # Student modules
    student_modules = ['View Courses', 'View Attendance', 'View Grades', 'View Fees']
    for i, module in enumerate(student_modules):
        rect = FancyBboxPatch((9.8, 7.2 - i*1.1), 3.4, 0.8, boxstyle="round,pad=0.02",
                              facecolor='white', edgecolor='#F57C00', linewidth=1.5)
        ax.add_patch(rect)
        ax.text(11.5, 7.6 - i*1.1, module, fontsize=9, ha='center', va='center')
    
    # Database Box
    db_box = FancyBboxPatch((5, 0.5), 4, 1.5, boxstyle="round,pad=0.05",
                            facecolor='#FCE4EC', edgecolor='#C2185B', linewidth=2)
    ax.add_patch(db_box)
    ax.text(7, 1.25, 'PostgreSQL Database', fontsize=11, fontweight='bold', ha='center', va='center')
    
    # Authentication Box
    auth_box = FancyBboxPatch((5, 2.5), 4, 1.5, boxstyle="round,pad=0.05",
                              facecolor='#F3E5F5', edgecolor='#7B1FA2', linewidth=2)
    ax.add_patch(auth_box)
    ax.text(7, 3.25, 'Authentication Module\n(OAuth 2.0 / JWT)', fontsize=10, fontweight='bold', ha='center', va='center')
    
    # Arrows
    ax.annotate('', xy=(5, 3.25), xytext=(4.5, 5),
                arrowprops=dict(arrowstyle='->', color='#1976D2', lw=1.5))
    ax.annotate('', xy=(7, 4), xytext=(7, 4.5),
                arrowprops=dict(arrowstyle='<->', color='#388E3C', lw=1.5))
    ax.annotate('', xy=(9, 3.25), xytext=(9.5, 5),
                arrowprops=dict(arrowstyle='->', color='#F57C00', lw=1.5))
    ax.annotate('', xy=(7, 2), xytext=(7, 2.5),
                arrowprops=dict(arrowstyle='<->', color='#C2185B', lw=1.5))
    
    plt.tight_layout()
    plt.savefig('d:/Drumil/edumanage-sms/diagrams/output/block_diagram.png', dpi=150, bbox_inches='tight', 
                facecolor='white', edgecolor='none')
    plt.close()
    print("Block Diagram created successfully!")

# ============================================
# 2. SEQUENCE DIAGRAM
# ============================================
def create_sequence_diagram():
    fig, ax = plt.subplots(1, 1, figsize=(14, 12))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 12)
    ax.axis('off')
    ax.set_title('Sequence Diagram - User Authentication Flow', fontsize=16, fontweight='bold', pad=20)
    
    # Actors/Components
    components = ['User', 'React\nFrontend', 'FastAPI\nBackend', 'OAuth\nProvider', 'PostgreSQL\nDatabase']
    positions = [1, 4, 7, 10, 13]
    colors = ['#E3F2FD', '#E8F5E9', '#FFF3E0', '#F3E5F5', '#FCE4EC']
    
    for i, (comp, pos, color) in enumerate(zip(components, positions, colors)):
        rect = FancyBboxPatch((pos-0.8, 10.5), 1.6, 1, boxstyle="round,pad=0.02",
                              facecolor=color, edgecolor='black', linewidth=1.5)
        ax.add_patch(rect)
        ax.text(pos, 11, comp, fontsize=9, ha='center', va='center', fontweight='bold')
        # Lifeline
        ax.plot([pos, pos], [0.5, 10.5], 'k--', linewidth=1, alpha=0.5)
    
    # Messages
    messages = [
        (1, 4, 9.5, 'Click Login', '#1976D2'),
        (4, 7, 8.8, 'Request OAuth URL', '#388E3C'),
        (7, 10, 8.1, 'Redirect to Provider', '#7B1FA2'),
        (10, 7, 7.4, 'Return Auth Code', '#7B1FA2'),
        (7, 10, 6.7, 'Exchange Code for Token', '#7B1FA2'),
        (10, 7, 6.0, 'Return User Info', '#7B1FA2'),
        (7, 13, 5.3, 'Check/Create User', '#C2185B'),
        (13, 7, 4.6, 'Return User Data', '#C2185B'),
        (7, 4, 3.9, 'Return JWT Token', '#388E3C'),
        (4, 1, 3.2, 'Redirect to Dashboard', '#1976D2'),
    ]
    
    for start, end, y, text, color in messages:
        ax.annotate('', xy=(end, y), xytext=(start, y),
                   arrowprops=dict(arrowstyle='->', color=color, lw=1.5))
        mid = (start + end) / 2
        ax.text(mid, y + 0.25, text, fontsize=8, ha='center', va='bottom',
               bbox=dict(boxstyle='round,pad=0.2', facecolor='white', edgecolor=color, alpha=0.9))
    
    # Add step numbers
    for i, (_, _, y, _, _) in enumerate(messages, 1):
        ax.text(0.3, y, str(i), fontsize=9, ha='center', va='center',
               bbox=dict(boxstyle='circle,pad=0.2', facecolor='#FFEB3B', edgecolor='black'))
    
    plt.tight_layout()
    plt.savefig('d:/Drumil/edumanage-sms/diagrams/output/sequence_diagram.png', dpi=150, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    plt.close()
    print("Sequence Diagram created successfully!")

# ============================================
# 3. FLOW CHART
# ============================================
def create_flowchart():
    fig, ax = plt.subplots(1, 1, figsize=(12, 14))
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 14)
    ax.axis('off')
    ax.set_title('Flow Chart - Student Enrollment Process', fontsize=16, fontweight='bold', pad=20)
    
    # Start
    ellipse = Ellipse((6, 13), 2, 0.8, facecolor='#C8E6C9', edgecolor='#2E7D32', linewidth=2)
    ax.add_patch(ellipse)
    ax.text(6, 13, 'START', fontsize=10, ha='center', va='center', fontweight='bold')
    
    # Process boxes and diamonds
    def add_process(x, y, text, color='#E3F2FD', edge='#1976D2'):
        rect = FancyBboxPatch((x-1.5, y-0.4), 3, 0.8, boxstyle="round,pad=0.02",
                              facecolor=color, edgecolor=edge, linewidth=1.5)
        ax.add_patch(rect)
        ax.text(x, y, text, fontsize=9, ha='center', va='center')
    
    def add_diamond(x, y, text, color='#FFF9C4', edge='#F9A825'):
        diamond = Polygon([(x, y+0.6), (x+1.2, y), (x, y-0.6), (x-1.2, y)],
                         facecolor=color, edgecolor=edge, linewidth=1.5)
        ax.add_patch(diamond)
        ax.text(x, y, text, fontsize=8, ha='center', va='center')
    
    # Flow elements
    add_process(6, 11.8, 'Student Logs In')
    add_process(6, 10.5, 'Views Course Catalog')
    add_process(6, 9.2, 'Selects Course')
    add_diamond(6, 7.8, 'Course\nAvailable?')
    add_process(6, 6.4, 'Submit Enrollment\nRequest')
    add_diamond(6, 5, 'Prerequisites\nMet?')
    add_process(6, 3.6, 'Enrollment Confirmed')
    add_process(6, 2.3, 'Update Database')
    
    # End
    ellipse_end = Ellipse((6, 1), 2, 0.8, facecolor='#FFCDD2', edgecolor='#C62828', linewidth=2)
    ax.add_patch(ellipse_end)
    ax.text(6, 1, 'END', fontsize=10, ha='center', va='center', fontweight='bold')
    
    # Side processes
    add_process(10, 7.8, 'Show "Course Full"\nMessage', '#FFCDD2', '#C62828')
    add_process(10, 5, 'Show "Prerequisites\nNot Met" Error', '#FFCDD2', '#C62828')
    
    # Arrows
    arrows = [
        ((6, 12.6), (6, 12.2)),  # Start to Login
        ((6, 11.4), (6, 10.9)),  # Login to Catalog
        ((6, 10.1), (6, 9.6)),   # Catalog to Select
        ((6, 8.8), (6, 8.4)),    # Select to Available?
        ((6, 7.2), (6, 6.8)),    # Available to Submit
        ((6, 6), (6, 5.6)),      # Submit to Prerequisites?
        ((6, 4.4), (6, 4)),      # Prerequisites to Confirmed
        ((6, 3.2), (6, 2.7)),    # Confirmed to Update
        ((6, 1.9), (6, 1.4)),    # Update to End
    ]
    
    for start, end in arrows:
        ax.annotate('', xy=end, xytext=start, arrowprops=dict(arrowstyle='->', color='black', lw=1.5))
    
    # Yes/No arrows
    ax.annotate('', xy=(6, 6.8), xytext=(6, 7.2), arrowprops=dict(arrowstyle='->', color='#2E7D32', lw=1.5))
    ax.text(6.3, 7, 'Yes', fontsize=8, color='#2E7D32', fontweight='bold')
    
    ax.annotate('', xy=(8.5, 7.8), xytext=(7.2, 7.8), arrowprops=dict(arrowstyle='->', color='#C62828', lw=1.5))
    ax.text(7.8, 8.1, 'No', fontsize=8, color='#C62828', fontweight='bold')
    
    ax.annotate('', xy=(6, 4), xytext=(6, 4.4), arrowprops=dict(arrowstyle='->', color='#2E7D32', lw=1.5))
    ax.text(6.3, 4.2, 'Yes', fontsize=8, color='#2E7D32', fontweight='bold')
    
    ax.annotate('', xy=(8.5, 5), xytext=(7.2, 5), arrowprops=dict(arrowstyle='->', color='#C62828', lw=1.5))
    ax.text(7.8, 5.3, 'No', fontsize=8, color='#C62828', fontweight='bold')
    
    plt.tight_layout()
    plt.savefig('d:/Drumil/edumanage-sms/diagrams/output/flowchart.png', dpi=150, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    plt.close()
    print("Flow Chart created successfully!")

# ============================================
# 4. E-R DIAGRAM
# ============================================
def create_er_diagram():
    fig, ax = plt.subplots(1, 1, figsize=(16, 12))
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 12)
    ax.axis('off')
    ax.set_title('E-R Diagram - EduManage Database Schema', fontsize=16, fontweight='bold', pad=20)
    
    def add_entity(x, y, name, attributes, pk, color='#E3F2FD', edge='#1976D2'):
        # Entity box
        height = 0.5 + len(attributes) * 0.4
        rect = FancyBboxPatch((x-1.3, y-height/2), 2.6, height, boxstyle="round,pad=0.02",
                              facecolor=color, edgecolor=edge, linewidth=2)
        ax.add_patch(rect)
        
        # Entity name (header)
        ax.text(x, y + height/2 - 0.3, name, fontsize=10, ha='center', va='center', fontweight='bold')
        ax.plot([x-1.2, x+1.2], [y + height/2 - 0.5, y + height/2 - 0.5], color=edge, linewidth=1)
        
        # Attributes
        for i, attr in enumerate(attributes):
            prefix = 'PK ' if attr == pk else '      '
            style = 'italic' if attr == pk else 'normal'
            ax.text(x-1.1, y + height/2 - 0.7 - i*0.4, f'{prefix}{attr}', fontsize=8, 
                   ha='left', va='center', style=style)
    
    # Entities
    add_entity(2, 9.5, 'USER', ['user_id', 'email', 'name', 'role', 'password_hash'], 'user_id', '#E3F2FD', '#1976D2')
    add_entity(8, 9.5, 'STUDENT', ['student_id', 'user_id', 'enrollment_no', 'semester', 'department'], 'student_id', '#E8F5E9', '#388E3C')
    add_entity(14, 9.5, 'COURSE', ['course_id', 'code', 'name', 'credits', 'semester'], 'course_id', '#FFF3E0', '#F57C00')
    add_entity(2, 5, 'ENROLLMENT', ['enrollment_id', 'student_id', 'course_id', 'status', 'enrolled_at'], 'enrollment_id', '#F3E5F5', '#7B1FA2')
    add_entity(8, 5, 'ATTENDANCE', ['attendance_id', 'student_id', 'course_id', 'date', 'status'], 'attendance_id', '#FCE4EC', '#C2185B')
    add_entity(14, 5, 'GRADE', ['grade_id', 'student_id', 'course_id', 'marks', 'grade'], 'grade_id', '#E0F7FA', '#00838F')
    add_entity(5, 1.5, 'FEE', ['fee_id', 'student_id', 'amount', 'due_date', 'status'], 'fee_id', '#FFF8E1', '#FF8F00')
    add_entity(11, 1.5, 'PAYMENT', ['payment_id', 'fee_id', 'amount', 'payment_date', 'method'], 'payment_id', '#F1F8E9', '#689F38')
    
    # Relationships (diamonds)
    def add_relationship(x, y, text):
        diamond = Polygon([(x, y+0.4), (x+0.8, y), (x, y-0.4), (x-0.8, y)],
                         facecolor='#FFEB3B', edgecolor='#F57F17', linewidth=1.5)
        ax.add_patch(diamond)
        ax.text(x, y, text, fontsize=7, ha='center', va='center')
    
    # Relationship diamonds and connections
    add_relationship(5, 9.5, 'has')
    ax.plot([3.3, 4.2], [9.5, 9.5], 'k-', linewidth=1.5)
    ax.plot([5.8, 6.7], [9.5, 9.5], 'k-', linewidth=1.5)
    ax.text(3.7, 9.7, '1', fontsize=8)
    ax.text(6.3, 9.7, '1', fontsize=8)
    
    add_relationship(11, 9.5, 'enrolls')
    ax.plot([9.3, 10.2], [9.5, 9.5], 'k-', linewidth=1.5)
    ax.plot([11.8, 12.7], [9.5, 9.5], 'k-', linewidth=1.5)
    ax.text(9.7, 9.7, 'N', fontsize=8)
    ax.text(12.3, 9.7, 'M', fontsize=8)
    
    # Vertical relationships
    ax.plot([8, 8], [7.8, 6.8], 'k-', linewidth=1.5)
    ax.text(8.2, 7.3, 'has', fontsize=8, bbox=dict(boxstyle='round,pad=0.1', facecolor='#FFEB3B'))
    
    ax.plot([2, 2], [7.3, 6.8], 'k-', linewidth=1.5)
    ax.plot([8, 2], [5, 5], 'k-', linewidth=1.5)
    
    ax.plot([14, 14], [7.8, 6.8], 'k-', linewidth=1.5)
    ax.text(14.2, 7.3, 'has', fontsize=8, bbox=dict(boxstyle='round,pad=0.1', facecolor='#FFEB3B'))
    
    # Fee-Payment relationship
    ax.plot([6.3, 9.7], [1.5, 1.5], 'k-', linewidth=1.5)
    ax.text(8, 1.7, 'generates', fontsize=8, bbox=dict(boxstyle='round,pad=0.1', facecolor='#FFEB3B'))
    ax.text(6.7, 1.3, '1', fontsize=8)
    ax.text(9.3, 1.3, 'N', fontsize=8)
    
    # Student-Fee relationship
    ax.plot([8, 5], [3.2, 2.5], 'k-', linewidth=1.5)
    ax.text(6.2, 3, 'pays', fontsize=8, bbox=dict(boxstyle='round,pad=0.1', facecolor='#FFEB3B'))
    
    plt.tight_layout()
    plt.savefig('d:/Drumil/edumanage-sms/diagrams/output/er_diagram.png', dpi=150, bbox_inches='tight',
                facecolor='white', edgecolor='none')
    plt.close()
    print("E-R Diagram created successfully!")

# Run all diagram generators
if __name__ == "__main__":
    print("Creating diagrams for EduManage System...")
    create_block_diagram()
    create_sequence_diagram()
    create_flowchart()
    create_er_diagram()
    print("\nAll diagrams created successfully!")
    print("Location: d:/Drumil/edumanage-sms/diagrams/output/")
