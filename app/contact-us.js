import React, { useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Logo from '../components/Logo';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: '#0077B6',
  secondary: '#F4A261',
  success: '#27AE60',
  background: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  surface: '#F8FAFC',
  error: '#DC2626',
  lightBg: '#F0F9FF',
};

const CONTACT_INFO = [
  {
    icon: 'call-outline',
    label: 'Phone',
    value: '+250 788 123 456',
    detail: 'Available 24/7',
  },
  {
    icon: 'mail-outline',
    label: 'Email',
    value: 'support@safaritix.com',
    detail: 'Reply within 2 hours',
  },
  {
    icon: 'location-outline',
    label: 'Address',
    value: 'Kigali, Rwanda',
    detail: 'Central Business District',
  },
  {
    icon: 'time-outline',
    label: 'Hours',
    value: 'Mon - Fri: 8AM - 6PM',
    detail: 'Sat: 9AM - 4PM',
  },
];

const OFFICE_LOCATIONS = [
  {
    city: 'Kigali',
    address: '123 Business Avenue, CBD',
    phone: '+250 788 123 456',
    hours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-4PM',
  },
  {
    city: 'Gitarama',
    address: '456 Commerce Street',
    phone: '+250 788 234 567',
    hours: 'Mon-Fri: 9AM-5PM, Sat: 10AM-3PM',
  },
  {
    city: 'Huye',
    address: '789 Market Road',
    phone: '+250 788 345 678',
    hours: 'Mon-Fri: 8AM-5PM, Sat: 9AM-2PM',
  },
];

function Header({ onMenuPress, onBackPress }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBackPress} style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}>
        <Ionicons name="arrow-back" size={20} color={COLORS.text} />
      </Pressable>
      <Logo width={175} height={56} />
      <Pressable
        onPress={onMenuPress}
        style={({ pressed }) => [styles.menuButton, pressed && styles.menuButtonPressed]}
      >
        <Ionicons name="menu" size={20} color={COLORS.text} />
      </Pressable>
    </View>
  );
}

function ContactForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email format';
    if (!form.subject.trim()) newErrors.subject = 'Subject is required';
    if (!form.message.trim()) newErrors.message = 'Message is required';
    return newErrors;
  };

  const handleSubmit = () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    onSubmit(form);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.sectionHeading}>Send us a Message</Text>
      <Text style={styles.formSubtitle}>Fill out the form below and we'll get back to you as soon as possible</Text>

      {/* Name Input */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Full Name *</Text>
        <TextInput
          placeholder="Your full name"
          placeholderTextColor={COLORS.muted}
          value={form.name}
          onChangeText={(text) => {
            setForm({ ...form, name: text });
            if (errors.name) setErrors({ ...errors, name: '' });
          }}
          style={[styles.formInput, errors.name && styles.formInputError]}
          editable={!loading}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>

      {/* Email Input */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Email Address *</Text>
        <TextInput
          placeholder="your@email.com"
          placeholderTextColor={COLORS.muted}
          value={form.email}
          onChangeText={(text) => {
            setForm({ ...form, email: text });
            if (errors.email) setErrors({ ...errors, email: '' });
          }}
          keyboardType="email-address"
          style={[styles.formInput, errors.email && styles.formInputError]}
          editable={!loading}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      {/* Subject Input */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Subject *</Text>
        <TextInput
          placeholder="How can we help?"
          placeholderTextColor={COLORS.muted}
          value={form.subject}
          onChangeText={(text) => {
            setForm({ ...form, subject: text });
            if (errors.subject) setErrors({ ...errors, subject: '' });
          }}
          style={[styles.formInput, errors.subject && styles.formInputError]}
          editable={!loading}
        />
        {errors.subject && <Text style={styles.errorText}>{errors.subject}</Text>}
      </View>

      {/* Message Input */}
      <View style={styles.formGroup}>
        <Text style={styles.formLabel}>Message *</Text>
        <TextInput
          placeholder="Tell us more details..."
          placeholderTextColor={COLORS.muted}
          value={form.message}
          onChangeText={(text) => {
            setForm({ ...form, message: text });
            if (errors.message) setErrors({ ...errors, message: '' });
          }}
          multiline
          numberOfLines={4}
          style={[styles.formTextarea, errors.message && styles.formInputError]}
          editable={!loading}
          textAlignVertical="top"
        />
        {errors.message && <Text style={styles.errorText}>{errors.message}</Text>}
      </View>

      {/* Submit Button */}
      <Pressable
        onPress={handleSubmit}
        disabled={loading}
        style={({ pressed }) => [styles.submitButton, pressed && !loading && styles.submitButtonPressed]}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <>
            <Text style={styles.submitButtonText}>Send Message</Text>
            <Ionicons name="send" size={16} color="#FFFFFF" />
          </>
        )}
      </Pressable>
    </View>
  );
}

function ContactInfoCard({ icon, label, value, detail }) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoIconContainer}>
        <Ionicons name={icon} size={22} color={COLORS.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
        <Text style={styles.infoDetail}>{detail}</Text>
      </View>
    </View>
  );
}

function OfficeLocationCard({ city, address, phone, hours }) {
  return (
    <View style={styles.locationCard}>
      <View style={styles.locationHeader}>
        <Ionicons name="business" size={18} color={COLORS.primary} />
        <Text style={styles.locationCity}>{city}</Text>
      </View>
      <View style={styles.locationContent}>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={14} color={COLORS.muted} />
          <Text style={styles.locationText}>{address}</Text>
        </View>
        <View style={styles.locationRow}>
          <Ionicons name="call" size={14} color={COLORS.muted} />
          <Text style={styles.locationText}>{phone}</Text>
        </View>
        <View style={styles.locationRow}>
          <Ionicons name="time" size={14} color={COLORS.muted} />
          <Text style={styles.locationText}>{hours}</Text>
        </View>
      </View>
    </View>
  );
}

function FAQ() {
  const [expandedIdx, setExpandedIdx] = useState(null);

  const faqItems = [
    {
      question: 'How can I track my bus?',
      answer: 'Once you book a ticket, you can use the "Track Bus" feature to see real-time location and arrival time.',
    },
    {
      question: 'What is your refund policy?',
      answer: 'Refunds are available up to 2 hours before departure. After that, you can reschedule to another trip.',
    },
    {
      question: 'Do you offer group bookings?',
      answer: 'Yes! For groups of 10 or more, please contact our corporate team for special rates.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept mobile money (MTN, Airtel, Equity), bank transfers, and credit/debit cards.',
    },
  ];

  return (
    <View style={styles.faqContainer}>
      <Text style={styles.sectionHeading}>Frequently Asked Questions</Text>
      {faqItems.map((item, idx) => (
        <Pressable
          key={idx}
          onPress={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
          style={styles.faqItem}
        >
          <View style={styles.faqQuestion}>
            <Text style={styles.faqQuestionText}>{item.question}</Text>
            <Ionicons
              name={expandedIdx === idx ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={COLORS.primary}
            />
          </View>
          {expandedIdx === idx && (
            <Text style={styles.faqAnswer}>{item.answer}</Text>
          )}
        </Pressable>
      ))}
    </View>
  );
}

function SocialLinks() {
  const socialLinks = [
    { icon: 'logo-facebook', label: 'Facebook', color: '#1877F2' },
    { icon: 'logo-twitter', label: 'Twitter', color: '#1DA1F2' },
    { icon: 'logo-instagram', label: 'Instagram', color: '#E1306C' },
    { icon: 'logo-linkedin', label: 'LinkedIn', color: '#0A66C2' },
  ];

  return (
    <View style={styles.socialContainer}>
      <Text style={styles.sectionHeading}>Follow Us</Text>
      <Text style={styles.socialSubtitle}>Connect with us on social media for updates and news</Text>
      <View style={styles.socialLinks}>
        {socialLinks.map((link, idx) => (
          <Pressable
            key={idx}
            style={({ pressed }) => [styles.socialButton, pressed && styles.socialButtonPressed]}
          >
            <Ionicons name={link.icon} size={24} color={link.color} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function ContactUsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const menuWidth = Math.min(width * 0.76, 320);
  const menuSlideAnim = useRef(new Animated.Value(menuWidth)).current;
  const menuOverlayAnim = useRef(new Animated.Value(0)).current;
  const [isMenuMounted, setIsMenuMounted] = useState(false);

  const handleSubmitForm = async (formData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      Alert.alert('Success', 'Your message has been sent! We will get back to you soon.');
    } catch (error) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openMenu = () => {
    setIsMenuMounted(true);
    Animated.parallel([
      Animated.timing(menuSlideAnim, {
        toValue: 0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(menuOverlayAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(menuSlideAnim, {
        toValue: menuWidth,
        duration: 240,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(menuOverlayAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsMenuMounted(false);
    });
  };

  const handleMenuSelect = (key) => {
    closeMenu();
    if (key === 'home') {
      router.push('/LandingPage');
      return;
    }
    if (key === 'tickets') {
      router.push('/my-tickets');
      return;
    }
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Header
          onMenuPress={openMenu}
          onBackPress={() => router.back()}
        />

        {/* Hero Section */}
        <LinearGradient colors={[COLORS.lightBg, '#E0F7FF']} style={styles.heroSection}>
          <View style={styles.heroContent}>
            <Ionicons name="information-circle" size={32} color={COLORS.primary} />
            <Text style={styles.heroTitle}>Get In Touch</Text>
            <Text style={styles.heroSubtitle}>We'd love to hear from you. Send us a message and we'll respond as soon as possible.</Text>
          </View>
        </LinearGradient>

        {/* Quick Contact Info */}
        <View style={styles.quickInfoContainer}>
          <Text style={styles.sectionHeading}>Quick Contact</Text>
          <View style={styles.infoGrid}>
            {CONTACT_INFO.map((info, idx) => (
              <ContactInfoCard key={idx} {...info} />
            ))}
          </View>
        </View>

        {/* Contact Form */}
        <ContactForm onSubmit={handleSubmitForm} loading={loading} />

        {/* Office Locations */}
        <View style={styles.locationsContainer}>
          <Text style={styles.sectionHeading}>Our Offices</Text>
          <Text style={styles.locationsSubtitle}>Visit us at any of our locations</Text>
          <View style={styles.locationsList}>
            {OFFICE_LOCATIONS.map((location, idx) => (
              <OfficeLocationCard key={idx} {...location} />
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <FAQ />

        {/* Social Links */}
        <SocialLinks />

        {/* Footer CTA */}
        <LinearGradient colors={[COLORS.primary, '#005E90']} style={styles.footerCta}>
          <View style={styles.footerCtaContent}>
            <Ionicons name="help-circle" size={28} color="#FFFFFF" />
            <Text style={styles.footerCtaText}>Still need help?</Text>
            <Text style={styles.footerCtaSubtext}>Our support team is here for you 24/7</Text>
          </View>
        </LinearGradient>
      </ScrollView>

      {/* Slide Menu */}
      {isMenuMounted && (
        <View style={styles.menuOverlayContainer} pointerEvents="box-none">
          <Animated.View style={[styles.menuBackdrop, { opacity: menuOverlayAnim }]}>
            <Pressable style={styles.menuBackdropPressArea} onPress={closeMenu} />
          </Animated.View>

          <Animated.View
            style={[
              styles.menuPanel,
              {
                transform: [{ translateX: menuSlideAnim }],
              },
            ]}
          >
            <View style={styles.menuTopRow}>
              <Logo width={150} height={50} />
              <Pressable onPress={closeMenu} style={({ pressed }) => [styles.menuCloseButton, pressed && styles.menuCloseButtonPressed]}>
                <Ionicons name="close" size={18} color={COLORS.text} />
              </Pressable>
            </View>

            <View style={styles.menuList}>
              <Pressable
                onPress={() => handleMenuSelect('home')}
                style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
              >
                <Ionicons name="home-outline" size={16} color={COLORS.primary} />
                <Text style={styles.menuItemText}>Home</Text>
              </Pressable>
              <Pressable
                onPress={() => handleMenuSelect('tickets')}
                style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
              >
                <Ionicons name="ticket-outline" size={16} color={COLORS.primary} />
                <Text style={styles.menuItemText}>My Tickets</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 20,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  backButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  menuButtonPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.96 }],
  },

  // Hero Section
  heroSection: {
    borderRadius: 16,
    padding: 20,
    gap: 12,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
    gap: 10,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.text,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 13,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 19,
  },

  // Section Heading
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },

  // Quick Contact Info
  quickInfoContainer: {
    gap: 14,
  },
  infoGrid: {
    gap: 12,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    gap: 12,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.lightBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  infoDetail: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 2,
  },

  // Form Styles
  formContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  formSubtitle: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 19,
  },
  formGroup: {
    gap: 7,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  formInput: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  formTextarea: {
    minHeight: 120,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  formInputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '500',
  },
  submitButton: {
    minHeight: 50,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  submitButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  // Office Locations
  locationsContainer: {
    gap: 14,
  },
  locationsSubtitle: {
    fontSize: 13,
    color: COLORS.muted,
    lineHeight: 19,
  },
  locationsList: {
    gap: 12,
  },
  locationCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationCity: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  locationContent: {
    gap: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.muted,
    flex: 1,
    lineHeight: 17,
  },

  // FAQ
  faqContainer: {
    gap: 14,
  },
  faqItem: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    paddingRight: 12,
  },
  faqQuestionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
    lineHeight: 20,
  },
  faqAnswer: {
    fontSize: 13,
    color: COLORS.muted,
    paddingHorizontal: 14,
    paddingBottom: 14,
    lineHeight: 19,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  // Social Links
  socialContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  socialSubtitle: {
    fontSize: 13,
    color: COLORS.muted,
    textAlign: 'center',
  },
  socialLinks: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButtonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },

  // Footer CTA
  footerCta: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  footerCtaContent: {
    alignItems: 'center',
    gap: 8,
  },
  footerCtaText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  footerCtaSubtext: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },

  // Menu
  menuOverlayContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  menuBackdropPressArea: {
    flex: 1,
  },
  menuPanel: {
    width: Math.min(width * 0.76, 320),
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 42,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 12,
  },
  menuTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  menuCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  menuCloseButtonPressed: {
    opacity: 0.72,
  },
  menuList: {
    gap: 10,
  },
  menuItem: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DCE5F0',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuItemPressed: {
    transform: [{ scale: 0.98 }],
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
});
