/**
 * @file Shared public FDA label summary trigger and modal for drug detail screens.
 */

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View, Platform } from 'react-native';

import Colors from '../../constant/Colors';
import { queryKeys } from '../../constant/QueryKeys';
import { ExternalMedicineSummary } from '../../services/api/summary-normalizers';
import { resolveFdaLabelSummary } from '../../services/api/external-summaries';

interface FdaSummarySectionProps {
  queryText?: string;
  triggerLabel?: string;
  title?: string;
}

/**
 * Renders a subtle link that opens a modal with public FDA label data.
 * Returns nothing when no summary is available.
 */
const FdaSummarySection: React.FC<FdaSummarySectionProps> = ({
  queryText,
  triggerLabel = 'View public FDA label summary',
  title = 'Public FDA label summary',
}) => {
  const [visible, setVisible] = useState(false);
  const triggerRef = useRef<any>(null);
  const closeButtonRef = useRef<any>(null);
  const queryClient = useQueryClient();
  const queryEnabled = Boolean(queryText);

  useEffect(() => {
    if (!queryText) {
      return;
    }

    queryClient.removeQueries({
      queryKey: ['external', 'openfda', 'label'],
      exact: false,
    });
  }, [queryClient, queryText]);

  const { data: summary, isPending } = useQuery<ExternalMedicineSummary | null>({
    queryKey: queryText ? queryKeys.medicineSources.openFdaLabel(queryText) : ['external', 'openfda', 'label', ''],
    queryFn: async () => {
      if (!queryText) {
        return null;
      }

      const trimmed = queryText.trim();
      const isNumericId = /^\d+$/.test(trimmed);

      return resolveFdaLabelSummary(
        isNumericId ? { supabaseDrugId: trimmed } : { drugName: trimmed },
      );
    },
    enabled: queryEnabled,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });

  const isLoading = queryEnabled && isPending;
  const hasSummary = Boolean(summary);
  const openModal = () => {
    setVisible(true);
  };

  const closeModal = () => {
    if (typeof document !== 'undefined') {
      const activeElement = document.activeElement as HTMLElement | null;
      activeElement?.blur?.();
    }
    setVisible(false);
    if (typeof window !== 'undefined') {
      window.requestAnimationFrame(() => {
        triggerRef.current?.focus?.();
      });
    }
  };

  useEffect(() => {
    if (!visible || typeof window === 'undefined') {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus?.();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [visible]);

  if (!queryText) {
    return null;
  }

  return (
    <>
      {isLoading ? (
        <View style={styles.loadingRow} accessible accessibilityLabel="Loading FDA info">
          <ActivityIndicator size="small" color={Colors.light.textSecondary} />
          <Text style={styles.mutedText}>Loading FDA info…</Text>
        </View>
      ) : null}

      {!isLoading && hasSummary ? (
        <Pressable ref={triggerRef} onPress={openModal} hitSlop={8} accessibilityRole="button">
          <Text style={styles.linkText}>{triggerLabel}</Text>
        </Pressable>
      ) : !isLoading ? (
        <Text style={styles.mutedText}>No FDA info available</Text>
      ) : null}

      {!isLoading && hasSummary ? (
        <Modal
          visible={visible}
          transparent
          animationType="fade"
          onRequestClose={closeModal}
          statusBarTranslucent
          accessibilityViewIsModal
          presentationStyle="overFullScreen"
        >
          <View style={styles.modalRoot}>
            <Pressable style={styles.backdrop} onPress={closeModal} accessibilityRole="button" />
            <View style={styles.card} accessible accessibilityLabel={title}>
              <View style={styles.header}>
                <View style={styles.headerTextWrap}>
                  <Text style={styles.title}>{title}</Text>
                  {queryText ? <Text style={styles.subTitle}>{queryText}</Text> : null}
                </View>

                <Pressable
                  ref={closeButtonRef}
                  onPress={closeModal}
                  style={styles.closeButton}
                  accessibilityRole="button"
                  accessibilityLabel="Close FDA label summary"
                >
                  <FontAwesome name="close" size={16} color={Colors.light.text} />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
                {summary?.brandNames?.length ? (
                  <Text style={styles.bodyText}>
                    <Text style={styles.bold}>Brands:</Text> {summary.brandNames.join(', ')}
                  </Text>
                ) : null}
                {summary?.genericNames?.length ? (
                  <Text style={styles.bodyText}>
                    <Text style={styles.bold}>Generics:</Text> {summary.genericNames.join(', ')}
                  </Text>
                ) : null}
                {summary?.indications ? (
                  <Text style={styles.bodyText}>
                    <Text style={styles.bold}>Indications:</Text> {summary.indications}
                  </Text>
                ) : null}
                {summary?.warnings ? (
                  <Text style={styles.bodyText}>
                    <Text style={styles.bold}>Warnings:</Text> {summary.warnings}
                  </Text>
                ) : null}
                {summary?.dosage ? (
                  <Text style={styles.bodyText}>
                    <Text style={styles.bold}>Dosage:</Text> {summary.dosage}
                  </Text>
                ) : null}
                {summary?.contraindications ? (
                  <Text style={styles.bodyText}>
                    <Text style={styles.bold}>Contraindications:</Text> {summary.contraindications}
                  </Text>
                ) : null}
                {summary?.boxedWarning ? (
                  <Text style={styles.bodyText}>
                    <Text style={styles.bold}>Boxed warning:</Text> {summary.boxedWarning}
                  </Text>
                ) : null}
                {summary?.adverseReactions ? (
                  <Text style={styles.bodyText}>
                    <Text style={styles.bold}>Adverse reactions:</Text> {summary.adverseReactions}
                  </Text>
                ) : null}
              </ScrollView>
            </View>
          </View>
        </Modal>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  linkText: {
    fontSize: 13,
    color: Colors.light.primary,
    marginTop: 6,
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  mutedText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 6,
    fontWeight: '500',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    minHeight: 20,
  },
  backdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Platform.select({
      web: {
        boxShadow: '0px 10px 24px rgba(15, 23, 42, 0.18)',
      },
      default: {
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
        elevation: 10,
      },
    }),
    maxHeight: '82%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  subTitle: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  closeButton: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: '#eef2f7',
  },
  body: {
    paddingBottom: 8,
  },
  bodyText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 10,
    lineHeight: 22,
  },
  bold: {
    fontWeight: '700',
    color: Colors.light.text,
  },
});

export default FdaSummarySection;